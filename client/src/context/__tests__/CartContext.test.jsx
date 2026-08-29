import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider } from "../CartContext";
import { useCart } from "../../hooks/useCart";

function wrapper({ children }) {
  return <CartProvider>{children}</CartProvider>;
}

const product = { _id: "p1", name: "Serum", price: 5000 };
const product2 = { _id: "p2", name: "Cream", price: 3000 };

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds a new product to the cart with quantity 1", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0]).toMatchObject({
      _id: "p1",
      quantity: 1,
    });
    expect(result.current.cartCount).toBe(1);
    expect(result.current.cartTotal).toBe(5000);
  });

  it("increments quantity when adding the same product again", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
      result.current.addToCart(product);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
    expect(result.current.cartTotal).toBe(10000);
  });

  it("removes a product from the cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
      result.current.addToCart(product2);
      result.current.removeFromCart("p1");
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0]._id).toBe("p2");
  });

  it("updateQuantity removes the item when quantity drops below 1", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
      result.current.updateQuantity("p1", 0);
    });

    expect(result.current.cartItems).toHaveLength(0);
  });

  it("clearCart empties the cart and localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
      result.current.clearCart();
    });

    expect(result.current.cartItems).toHaveLength(0);
    // clearCart() removes the key, but the cartItems-sync effect immediately
    // re-persists the now-empty array — assert on the parsed value.
    expect(JSON.parse(localStorage.getItem("cart"))).toEqual([]);
  });
});
