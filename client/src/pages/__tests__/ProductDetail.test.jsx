import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ProductDetail from "../ProductDetail";
import { CartProvider } from "../../context/CartContext";
import { ToastProvider } from "../../components/Toast";
import { AuthContext } from "../../hooks/useAuth";

const MOCK_PRODUCT = {
  _id: "prod-101",
  name: "Pure Glow Vitamin C Elixir",
  brand: "Radiant Skincare",
  price: 29900,
  originalPrice: 35000,
  rating: 4.8,
  numReviews: 24,
  category: "skincare",
  tags: ["vitamin c", "brightening", "radiance"],
  description: "Formulated with 15% pure L-Ascorbic Acid for luminous melanin radiance.",
  image: "https://example.com/vitc-bottle.jpg",
  isInStock: true,
  stock: 14,
};

const MOCK_REVIEWS = [
  {
    _id: "rev-1",
    name: "Amara Okonkwo",
    rating: 5,
    verified: true,
    skinType: "Oily",
    comment: "This cleared my stubborn dark marks completely!",
    helpful: 12,
  },
];

function renderProductDetail(props = {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/products/prod-101"]}>
        <AuthContext.Provider value={{ user: { name: "Test User", email: "test@example.com" }, loading: false }}>
          <ToastProvider>
            <CartProvider>
              <Routes>
                <Route
                  path="/products/:id"
                  element={<ProductDetail onCartOpen={props.onCartOpen} />}
                />
              </Routes>
            </CartProvider>
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe("ProductDetail (GLOWIFY Inspired Architecture)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn((url) => {
      if (url.includes("/api/products/prod-101")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_PRODUCT),
        });
      }
      if (url.includes("/api/products")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([MOCK_PRODUCT]),
        });
      }
      if (url.includes("/api/reviews/prod-101")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_REVIEWS),
        });
      }
      if (url.includes("/api/track/view") || url.includes("/api/wishlist")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it("renders product title, brand eyebrow, price in Naira, and breadcrumbs", async () => {
    renderProductDetail();

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pure Glow Vitamin C Elixir");
    });

    expect(screen.getByText("Radiant Skincare")).toBeInTheDocument();
    expect(screen.getByText("₦29,900")).toBeInTheDocument();
    expect(screen.getByText("Save 15%")).toBeInTheDocument();
    expect(screen.getByText(/100% Authentic Maison Guarantee/i)).toBeInTheDocument();
  });

  it("handles quantity stepper increment and decrement correctly", async () => {
    renderProductDetail();

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    const decreaseBtn = screen.getByRole("button", { name: /decrease quantity/i });
    const increaseBtn = screen.getByRole("button", { name: /increase quantity/i });

    // Initial quantity is 1, so decrease should be disabled
    expect(decreaseBtn).toBeDisabled();

    // Increment
    fireEvent.click(increaseBtn);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(decreaseBtn).not.toBeDisabled();

    // Decrement back to 1
    fireEvent.click(decreaseBtn);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(decreaseBtn).toBeDisabled();
  });

  it("adds product with custom quantity to bag and triggers onCartOpen", async () => {
    const onCartOpen = vi.fn();
    renderProductDetail({ onCartOpen });

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    // Increase quantity to 2
    const increaseBtn = screen.getByRole("button", { name: /increase quantity/i });
    fireEvent.click(increaseBtn);

    // Click Add to Bag
    const addBagBtn = screen.getByRole("button", { name: /\+ Add to Bag/i });
    fireEvent.click(addBagBtn);

    expect(onCartOpen).toHaveBeenCalled();
  });

  it("switches tabs between Description, Active Ingredients, How to Use, and Routine Fit", async () => {
    renderProductDetail();

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    // Initial tab is Description
    expect(screen.getByText(/About Pure Glow Vitamin C Elixir/i)).toBeInTheDocument();

    // Switch to Active Ingredients tab
    const ingredientsTab = screen.getByRole("button", { name: /Active Ingredients/i });
    fireEvent.click(ingredientsTab);
    expect(screen.getByText(/Potent Active Ingredients/i)).toBeInTheDocument();
    expect(screen.getAllByText(/15% Pure L-Ascorbic Acid/i).length).toBeGreaterThanOrEqual(1);

    // Switch to How to Use tab
    const howToTab = screen.getByRole("button", { name: /How to Use/i });
    fireEvent.click(howToTab);
    expect(screen.getByText(/How to Apply/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 01/i)).toBeInTheDocument();

    // Switch to Routine Fit tab
    const routineTab = screen.getByRole("button", { name: /Routine Fit/i });
    fireEvent.click(routineTab);
    expect(screen.getByText(/Ideal Routine Placement/i)).toBeInTheDocument();
  });

  it("renders customer reviews hub with 5-star progress bars", async () => {
    renderProductDetail();

    await waitFor(() => {
      expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
    });

    // Star bar labels
    expect(screen.getByText("5 Stars")).toBeInTheDocument();
    expect(screen.getByText("4 Stars")).toBeInTheDocument();

    // Verified review
    expect(screen.getByText("Amara Okonkwo")).toBeInTheDocument();
    expect(screen.getByText("✓ Verified Buyer")).toBeInTheDocument();
    expect(screen.getByText(/This cleared my stubborn dark marks completely!/i)).toBeInTheDocument();
  });

  it("renders available vouchers with 1-click clipboard copy", async () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    renderProductDetail();

    await waitFor(() => {
      expect(screen.getByText(/Available Vouchers For You/i)).toBeInTheDocument();
    });

    expect(screen.getByText("GLOW05")).toBeInTheDocument();
    expect(screen.getByText("BEAUTY20")).toBeInTheDocument();

    // Click GLOW05 voucher
    const voucherCard = screen.getByText("GLOW05").closest(".pdp-voucher-card");
    fireEvent.click(voucherCard);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("GLOW05");
  });
});
