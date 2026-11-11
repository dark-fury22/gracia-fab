import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Checkout from "../Checkout";
import { AuthContext } from "../../hooks/useAuth";
import { CartContext } from "../../hooks/useCart";

const mockUser = { _id: "u1", name: "Jane Doe", email: "jane@example.com" };
const cartItem = {
  _id: "p1",
  name: "Serum",
  image: "https://example.com/serum.jpg",
  price: 5000,
  quantity: 1,
};

function renderCheckout({ cartItems = [cartItem], cartTotal = 5000 } = {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <AuthContext.Provider value={{ user: mockUser, loading: false }}>
          <CartContext.Provider
            value={{ cartItems, cartTotal, clearCart: vi.fn() }}
          >
            <Checkout />
          </CartContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("Checkout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a validation error when required delivery fields are missing", async () => {
    renderCheckout();

    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    expect(
      await screen.findByText(/please fill in all delivery details/i),
    ).toBeInTheDocument();
  });

  it("creates the order and moves to the payment step on valid submit", async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ _id: "order1" }),
    });

    renderCheckout();

    fireEvent.change(screen.getByPlaceholderText(/08012345678/i), {
      target: { value: "08012345678" },
    });
    fireEvent.change(screen.getByPlaceholderText(/house number/i), {
      target: { value: "1 Main St" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. lagos/i), {
      target: { value: "Lagos" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Lagos" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    expect(
      await screen.findByRole("heading", { name: /complete payment/i }),
    ).toBeInTheDocument();
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/orders"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("charges Paystack the server's order total, not the cart's", async () => {
    vi.stubEnv("VITE_PAYSTACK_PUBLIC_KEY", "pk_test_dummy");
    const setup = vi.fn(() => ({ openIframe: vi.fn() }));
    window.PaystackPop = { setup };
    // The product's price changed since it was added to the cart: the cart
    // says ₦5,000 but the server prices it at ₦6,000 from the database.
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        _id: "order1",
        itemsPrice: 6000,
        deliveryPrice: 2500,
        totalPrice: 8500,
      }),
    });

    renderCheckout();

    fireEvent.change(screen.getByPlaceholderText(/08012345678/i), {
      target: { value: "08012345678" },
    });
    fireEvent.change(screen.getByPlaceholderText(/house number/i), {
      target: { value: "1 Main St" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. lagos/i), {
      target: { value: "Lagos" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Lagos" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    fireEvent.click(
      await screen.findByRole("button", { name: /pay with paystack/i }),
    );

    expect(setup).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 850000 }),
    );
    vi.unstubAllEnvs();
  });
});
