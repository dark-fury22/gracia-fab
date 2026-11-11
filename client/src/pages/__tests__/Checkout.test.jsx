import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("opens Monnify with the server's reference and total, then verifies", async () => {
    const initialize = vi.fn();
    window.MonnifySDK = { initialize };
    // The product's price changed since it was added to the cart: the cart
    // says ₦5,000 but the server prices it at ₦6,000 from the database.
    window.fetch = vi.fn(async (url) => ({
      ok: true,
      json: async () =>
        url.endsWith("/pay/init")
          ? {
              reference: "GF-order1-1",
              amount: 8500,
              currency: "NGN",
              customerName: "Jane Doe",
              customerEmail: "jane@example.com",
              apiKey: "MK_TEST_dummy",
              contractCode: "1234567890",
              isTestMode: true,
            }
          : url.endsWith("/pay")
            ? { _id: "order1", isPaid: true }
            : {
                _id: "order1",
                itemsPrice: 6000,
                deliveryPrice: 2500,
                totalPrice: 8500,
              },
    }));

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

    fireEvent.click(await screen.findByRole("button", { name: /pay now/i }));

    await waitFor(() => expect(initialize).toHaveBeenCalled());
    const options = initialize.mock.calls[0][0];
    expect(options).toMatchObject({
      amount: 8500,
      reference: "GF-order1-1",
      apiKey: "MK_TEST_dummy",
      contractCode: "1234567890",
    });

    // Monnify reports completion → the page asks the server to verify.
    options.onComplete({ paymentReference: "GF-order1-1", paymentStatus: "PAID" });
    await waitFor(() =>
      expect(window.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/orders/order1/pay"),
        expect.objectContaining({ method: "PUT" }),
      ),
    );
  });
});
