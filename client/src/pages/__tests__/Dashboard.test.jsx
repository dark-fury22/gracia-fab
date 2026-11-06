import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Dashboard from "../Dashboard";

// Mock hooks
const mockUser = {
  _id: "user123",
  name: "Esther Obisesan",
  email: "esther@example.com",
  isAdmin: false,
};

const mockLogout = vi.fn();
const mockAddToCart = vi.fn();
const mockUpdateProfile = vi.fn();
const mockResetProfile = vi.fn();
const mockAddToast = vi.fn();
const mockOnCartOpen = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
    loading: false,
  }),
}));

vi.mock("../../hooks/useCart", () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    cartItems: [],
  }),
}));

vi.mock("../../hooks/useBeautyProfile", () => ({
  useBeautyProfile: () => ({
    profile: {
      skinType: "oily",
      skinConcerns: "Acne & Hyperpigmentation",
      hairType: "coily",
      budget: "Moderate (₦10,000–₦25,000)",
      skinTone: { id: "tan", label: "Tan / Warm Caramel", hex: "#B8834A" },
    },
    updateProfile: mockUpdateProfile,
    resetProfile: mockResetProfile,
    hasProfile: true,
  }),
}));

vi.mock("../../hooks/useToast", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

describe("Dashboard Page - My Beauty Profile Hub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/orders/myorders")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                _id: "ord_101",
                totalPrice: 42000,
                status: "Delivered",
                orderItems: [
                  {
                    _id: "p_delivered_1",
                    name: "Purifying Gel Cleanser with Tea Tree",
                    price: 18000,
                    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=360",
                  },
                ],
              },
            ]),
        });
      }
      if (url.includes("/api/wishlist/recommendations/saved")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                _id: "rec_1",
                number: 1,
                date: "2026-10-25T10:00:00Z",
                products: [
                  {
                    _id: "rec_prod_1",
                    name: "Hydra-Gel Matte Day Moisturizer",
                    price: 23000,
                    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=160",
                  },
                ],
              },
            ]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  const renderDashboard = (initialTab = "beauty-profile") => {
    return render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/dashboard?tab=${initialTab}`]}>
          <Dashboard onCartOpen={mockOnCartOpen} />
        </MemoryRouter>
      </HelmetProvider>,
    );
  };

  it("renders the Beauty Profile Hub header with user attributes", () => {
    renderDashboard("beauty-profile");

    expect(screen.getByText("My Beauty Profile & Daily Rituals")).toBeInTheDocument();
    expect(screen.getAllByText("Oily").length).toBeGreaterThan(0);
    expect(screen.getByText("Acne & Hyperpigmentation")).toBeInTheDocument();
    expect(screen.getByText("Coily")).toBeInTheDocument();
  });

  it("displays the detected skin tone swatch and complexion details", () => {
    renderDashboard("beauty-profile");

    expect(screen.getByText(/Complexion & Melanin Profile/i)).toBeInTheDocument();
    expect(screen.getByText("Tan / Warm Caramel")).toBeInTheDocument();
    expect(screen.getByText(/Shop Foundation & Concealer Matches/i)).toBeInTheDocument();
  });

  it("renders saved daily routine steps and handles bulk reordering", () => {
    renderDashboard("beauty-profile");

    expect(screen.getByText("Saved Skincare Regimen")).toBeInTheDocument();

    // Morning tab should be active by default
    const bulkReorderBtn = screen.getByRole("button", {
      name: /\+ Reorder Entire Routine/i,
    });
    expect(bulkReorderBtn).toBeInTheDocument();

    fireEvent.click(bulkReorderBtn);
    expect(mockAddToCart).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.stringContaining("routine essentials added to bag"),
      "success",
    );
    expect(mockOnCartOpen).toHaveBeenCalled();
  });

  it("toggles between Morning, Night, and Weekly routine tabs", () => {
    renderDashboard("beauty-profile");

    const nightTabBtn = screen.getByRole("button", { name: /🌙 Night/i });
    fireEvent.click(nightTabBtn);
    expect(nightTabBtn).toHaveClass("active");

    const weeklyTabBtn = screen.getByRole("button", { name: /📅 Weekly/i });
    fireEvent.click(weeklyTabBtn);
    expect(weeklyTabBtn).toHaveClass("active");
  });

  it("adds individual routine step product to the bag", () => {
    renderDashboard("beauty-profile");

    const addButtons = screen.getAllByRole("button", { name: /\+ Add to Bag/i });
    expect(addButtons.length).toBeGreaterThan(0);

    fireEvent.click(addButtons[0]);
    expect(mockAddToCart).toHaveBeenCalled();
    expect(mockOnCartOpen).toHaveBeenCalled();
  });

  it("renders the 1-click replenishment empties section and adds item", async () => {
    renderDashboard("beauty-profile");

    expect(
      screen.getByText(/Replenish Your Routine Empties/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      const replenishButtons = screen.getAllByRole("button", {
        name: /⚡ Replenish & Reorder/i,
      });
      expect(replenishButtons.length).toBeGreaterThan(0);
      fireEvent.click(replenishButtons[0]);
      expect(mockAddToCart).toHaveBeenCalled();
      expect(mockOnCartOpen).toHaveBeenCalled();
    });
  });

  it("allows switching back to Orders and Profile tabs", () => {
    renderDashboard("beauty-profile");

    const ordersNavBtn = screen.getByRole("button", { name: "Orders" });
    fireEvent.click(ordersNavBtn);
    expect(ordersNavBtn).toHaveClass("active");

    const profileNavBtn = screen.getByRole("button", { name: "Profile" });
    fireEvent.click(profileNavBtn);
    expect(profileNavBtn).toHaveClass("active");
  });

  it("renders the return back button in topbar and continue shopping link in sidebar", () => {
    renderDashboard("beauty-profile");

    const backBtn = screen.getByRole("button", { name: /Return to previous page/i });
    expect(backBtn).toBeInTheDocument();
    expect(screen.getByText("Back to Store")).toBeInTheDocument();

    const continueShoppingBtn = screen.getByRole("button", {
      name: /← Continue Shopping/i,
    });
    expect(continueShoppingBtn).toBeInTheDocument();
  });

  it("navigates back to previous page or fallback when return button is clicked", () => {
    renderDashboard("beauty-profile");

    const backBtn = screen.getByRole("button", { name: /Return to previous page/i });
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalled();

    const continueShoppingBtn = screen.getByRole("button", {
      name: /← Continue Shopping/i,
    });
    fireEvent.click(continueShoppingBtn);
    expect(mockNavigate).toHaveBeenCalled();
  });
});

