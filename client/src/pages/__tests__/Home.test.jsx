import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Home from "../Home";
import { CartProvider } from "../../context/CartContext";
import { ToastProvider } from "../../components/Toast";
import { BeautyProfileProvider } from "../../context/BeautyProfileContext";
import { AuthContext } from "../../hooks/useAuth";

const MOCK_PRODUCTS = [
  {
    _id: "prod-cleanser-1",
    name: "Hydrating Face Cleanser",
    category: "skincare",
    price: 18000,
    rating: 4.8,
    reviewsCount: 1200,
    image: "https://example.com/cleanser.jpg",
  },
  {
    _id: "prod-toner-2",
    name: "Glow Balancing Toner",
    category: "skincare",
    price: 16500,
    rating: 4.7,
    reviewsCount: 980,
    image: "https://example.com/toner.jpg",
  },
];

function renderHome(props = {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <AuthContext.Provider value={{ user: null, loading: false }}>
          <ToastProvider>
            <CartProvider>
              <BeautyProfileProvider>
                <Home {...props} />
              </BeautyProfileProvider>
            </CartProvider>
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe("Home Page Flagship Editorial", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_PRODUCTS,
    });
    globalThis.fetch = mockFetch;
    window.fetch = mockFetch;

    const mockTrack = { stop: vi.fn() };
    const mockStream = { getTracks: () => [mockTrack] };
    navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(mockStream),
    };
  });

  it("renders the hero headline and action buttons", () => {
    renderHome();

    expect(screen.getByRole("heading", { name: /beauty, matched to you/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shop the collection/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /consult ai advisor/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /live undertone scan/i })).toBeInTheDocument();
  });

  it("does not render the removed trust strip", () => {
    renderHome();

    expect(screen.queryByText("Personalized Recommendations")).not.toBeInTheDocument();
    expect(screen.queryByText("African Undertone Scanner")).not.toBeInTheDocument();
  });

  it("renders the African Complexion & Undertone Showcase section", () => {
    renderHome();

    expect(screen.getByText(/formulated for african complexions/i)).toBeInTheDocument();
    expect(screen.getAllByText("Warm Golden").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rich Neutral").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Deep Espresso").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /launch live undertone camera/i })).toBeInTheDocument();
  });

  it("renders the Formulation Comparator spotlight section with table preview", () => {
    renderHome();

    expect(screen.getByText(/compare formulations/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /launch formulation comparator/i })).toBeInTheDocument();
    expect(screen.getByText("Ceramides + Hyaluronic")).toBeInTheDocument();
    expect(screen.getByText("Niacinamide 5% + Glycolic")).toBeInTheDocument();
  });

  it("opens the live camera detector modal when clicking live scan button", () => {
    renderHome();

    const scanBtn = screen.getByRole("button", { name: /live undertone scan/i });
    fireEvent.click(scanBtn);

    expect(screen.getByText(/african melanin & undertone analysis/i)).toBeInTheDocument();
  });

  it("renders new arrivals and adds an item to bag on quick-add click", () => {
    const onCartOpen = vi.fn();
    renderHome({ onCartOpen });

    expect(screen.getByText("Clarifying Herbal Cleansing Oil")).toBeInTheDocument();

    const addButtons = screen.getAllByRole("button", { name: /add.*to bag/i });
    expect(addButtons.length).toBeGreaterThan(0);

    fireEvent.click(addButtons[0]);
    expect(onCartOpen).toHaveBeenCalled();
  });

  it("renders promotional editorial banners and 4-pillar perks strip", () => {
    renderHome();

    expect(screen.getByText(/save 20% on your/i)).toBeInTheDocument();
    expect(screen.getByText("MAISON20")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /free delivery over ₦50,000/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /exclusive vip member discounts/i })).toBeInTheDocument();
    expect(screen.getByText("14-Day Purity Guarantee")).toBeInTheDocument();
    expect(screen.getByText("Melanin-First Formulations")).toBeInTheDocument();
  });
});
