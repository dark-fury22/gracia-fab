import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Products from "../Products";
import { CartProvider } from "../../context/CartContext";
import { ToastProvider } from "../../components/Toast";
import { AuthContext } from "../../hooks/useAuth";

const MOCK_CATALOG = [
  {
    _id: "prod-1",
    name: "Vitamin C Radiance Serum",
    category: "skincare",
    brand: "Beauty Formulas",
    price: 8500,
    originalPrice: 12000,
    rating: 4.8,
    numReviews: 24,
    description: "Brightening 15% Vitamin C serum for melanin radiance.",
    image: "https://example.com/vitc.jpg",
    isFeatured: true,
    suitableFor: { skinType: ["oily", "combination"], concern: ["dark spots"] },
  },
  {
    _id: "prod-2",
    name: "Raw Virgin HD Glueless Wig",
    category: "wig",
    brand: "Gracia Fab Couture",
    price: 95000,
    originalPrice: 120000,
    rating: 5.0,
    numReviews: 42,
    description: "100% single-donor raw human hair with Swiss lace.",
    image: "https://example.com/wig.jpg",
    isFeatured: true,
    suitableFor: { hairType: ["curly"] },
  },
  {
    _id: "prod-3",
    name: "Nourishing Castor Scalp Oil",
    category: "haircare",
    brand: "Artnaturals",
    price: 5900,
    rating: 4.6,
    numReviews: 18,
    description: "Organic hair growth oil infused with peppermint.",
    image: "https://example.com/oil.jpg",
    isFeatured: false,
    suitableFor: { hairType: ["curly", "coily"] },
  },
  {
    _id: "prod-4",
    name: "Bridal Glow Radiance Setting Spray",
    category: "bridal",
    brand: "Saltylicious",
    price: 14500,
    rating: 4.9,
    numReviews: 31,
    description: "Long-lasting dewy setting spray for bridal glam.",
    image: "https://example.com/spray.jpg",
    isFeatured: true,
    suitableFor: { skinType: ["all"] },
  },
];

function renderProducts(props = {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <AuthContext.Provider value={{ user: null, loading: false }}>
          <ToastProvider>
            <CartProvider>
              <Products {...props} />
            </CartProvider>
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe("Products Catalog Page (GLOWIFY Inspired Architecture)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/products")) {
        return Promise.resolve({
          ok: true,
          json: async () => MOCK_CATALOG,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      });
    });

    globalThis.fetch = mockFetch;
    window.fetch = mockFetch;
  });

  it("renders catalog hero headline, breadcrumbs and left filter sidebar", async () => {
    renderProducts();

    expect(screen.getByText("Discover Our Beauty Collection")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Price Range (₦)")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Vitamin C Radiance Serum")).toBeInTheDocument();
      expect(screen.getByText("Raw Virgin HD Glueless Wig")).toBeInTheDocument();
    });
  });

  it("filters products by category checkbox", async () => {
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("Vitamin C Radiance Serum")).toBeInTheDocument();
    });

    // Check "Skincare"
    const skincareLabel = screen.getByText("Skincare");
    fireEvent.click(skincareLabel);

    await waitFor(() => {
      expect(screen.getByText("Vitamin C Radiance Serum")).toBeInTheDocument();
      expect(screen.queryByText("Raw Virgin HD Glueless Wig")).not.toBeInTheDocument();
      expect(screen.queryByText("Nourishing Castor Scalp Oil")).not.toBeInTheDocument();
    });
  });

  it("filters products by search input keyword", async () => {
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("Vitamin C Radiance Serum")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search products/i);
    fireEvent.change(searchInput, { target: { value: "Scalp Oil" } });

    await waitFor(() => {
      expect(screen.getByText("Nourishing Castor Scalp Oil")).toBeInTheDocument();
      expect(screen.queryByText("Vitamin C Radiance Serum")).not.toBeInTheDocument();
      expect(screen.queryByText("Raw Virgin HD Glueless Wig")).not.toBeInTheDocument();
    });
  });

  it("toggles between Grid and List view modes", async () => {
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("Vitamin C Radiance Serum")).toBeInTheDocument();
    });

    const listBtn = screen.getByLabelText(/list view/i);
    fireEvent.click(listBtn);

    // List mode renders list-card-desc
    expect(screen.getByText(/Brightening 15% Vitamin C serum/i)).toBeInTheDocument();

    const gridBtn = screen.getByLabelText(/grid view/i);
    fireEvent.click(gridBtn);

    expect(screen.getByText("Vitamin C Radiance Serum")).toBeInTheDocument();
  });

  it("adds an item to bag and calls onCartOpen callback", async () => {
    const onCartOpen = vi.fn();
    renderProducts({ onCartOpen });

    await waitFor(() => {
      expect(screen.getByText("Vitamin C Radiance Serum")).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole("button", { name: /add.*to bag/i });
    expect(addButtons.length).toBeGreaterThan(0);

    fireEvent.click(addButtons[0]);
    expect(onCartOpen).toHaveBeenCalled();
  });

  it("clears all active filters when Clear All is clicked", async () => {
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("Vitamin C Radiance Serum")).toBeInTheDocument();
    });

    // Apply a search filter
    const searchInput = screen.getByPlaceholderText(/search products/i);
    fireEvent.change(searchInput, { target: { value: "Bridal" } });

    await waitFor(() => {
      expect(screen.getByText("Bridal Glow Radiance Setting Spray")).toBeInTheDocument();
      expect(screen.queryByText("Vitamin C Radiance Serum")).not.toBeInTheDocument();
    });

    // Click "Reset All"
    const resetBtn = screen.getByText("Reset All");
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText("Vitamin C Radiance Serum")).toBeInTheDocument();
      expect(screen.getByText("Raw Virgin HD Glueless Wig")).toBeInTheDocument();
    });
  });
});

