import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard, { ProductCardSkeleton } from "../ProductCard";
import { CartProvider } from "../../context/CartContext";
import { ToastProvider } from "../Toast";
import { AuthContext } from "../../hooks/useAuth";

const product = {
  _id: "p1",
  name: "Hydrating Serum",
  price: 5000,
  image: "https://example.com/serum.jpg",
};

function renderProductCard() {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <ToastProvider>
          <CartProvider>
            <ProductCard product={product} />
          </CartProvider>
        </ToastProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe("ProductCardSkeleton", () => {
  it("renders the skeleton placeholder", () => {
    const { container } = render(<ProductCardSkeleton />);

    expect(
      container.querySelector(".product-card-skeleton"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("ProductCard", () => {
  it("renders the product name and price", () => {
    renderProductCard();

    expect(screen.getByText("Hydrating Serum")).toBeInTheDocument();
    expect(screen.getByText("₦5,000")).toBeInTheDocument();
  });

  it("adds the product to the cart and shows a confirmation toast", () => {
    renderProductCard();

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(
      screen.getByText(/added hydrating serum to cart/i),
    ).toBeInTheDocument();
  });
});
