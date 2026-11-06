import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Compare from "../Compare";
import { CartProvider } from "../../context/CartContext";
import { ToastProvider } from "../../components/Toast";
import { AuthContext } from "../../hooks/useAuth";

const MOCK_PRODUCTS = [
  {
    _id: "prod-1",
    name: "Vitamin C Brightening Serum",
    brand: "Gracia Fab",
    price: 18500,
    rating: 4.8,
    numReviews: 24,
    category: "skincare",
    tags: ["brightening", "vitamin c", "glow"],
    description: "Brightens dark spots with 15% Vitamin C.",
    suitableFor: { skinType: ["oily", "combination"], concern: ["dark spots"] },
    image: "https://example.com/vitc.jpg",
  },
  {
    _id: "prod-2",
    name: "Retinol Night Renewal Serum",
    brand: "Gracia Fab",
    price: 22000,
    rating: 4.9,
    numReviews: 38,
    category: "skincare",
    tags: ["retinol", "anti-aging", "peptides"],
    description: "Smoothes fine lines with retinol.",
    suitableFor: { skinType: ["dry", "normal"], concern: ["fine lines"] },
    image: "https://example.com/retinol.jpg",
  },
];

function renderCompare(props = {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <AuthContext.Provider value={{ user: null, loading: false }}>
          <ToastProvider>
            <CartProvider>
              <Compare {...props} />
            </CartProvider>
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe("Compare (Beauty Product Comparison Tool)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, "fetch").mockResolvedValue({
      ok: true,
      json: async () => MOCK_PRODUCTS,
    });
  });

  it("renders the comparator title, presets, and hero section", async () => {
    renderCompare();

    expect(
      screen.getByRole("heading", { name: /side-by-side formulation analysis/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/vitamin c vs retinol serum/i)
    ).toBeInTheDocument();
  });

  it("renders comparison matrix rows with active ingredients, suitability and finish", async () => {
    renderCompare();

    // Verify matrix row headings
    expect(
      await screen.findByRole("heading", { name: /key active ingredients/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /recommended skin types/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /texture & skin finish/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /routine step & timing/i })
    ).toBeInTheDocument();
  });

  it("adds a compared product to the bag with toast and cart drawer trigger", async () => {
    const onCartOpen = vi.fn();
    renderCompare({ onCartOpen });

    const addButtons = await screen.findAllByRole("button", {
      name: /add to bag 🛍️/i,
    });
    expect(addButtons.length).toBeGreaterThan(0);

    fireEvent.click(addButtons[0]);

    expect(onCartOpen).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/added "vitamin c brightening serum" to your bag/i)
    ).toBeInTheDocument();
  });

  it("opens the product picker modal when clicking Add Product to Compare slot", async () => {
    renderCompare();

    const addSlot = await screen.findByText(/add product to compare/i);
    fireEvent.click(addSlot);

    expect(
      screen.getByRole("heading", { name: /choose product for comparison/i })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search by product name/i)
    ).toBeInTheDocument();
  });
});

