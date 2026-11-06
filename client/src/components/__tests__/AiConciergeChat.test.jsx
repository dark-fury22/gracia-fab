import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AiConciergeChat from "../AiConciergeChat";
import { CartProvider } from "../../context/CartContext";
import { ToastProvider } from "../Toast";

function renderAiConciergeChat(props = {}) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <CartProvider>
          <AiConciergeChat {...props} />
        </CartProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe("AiConciergeChat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the floating chat trigger button initially", () => {
    renderAiConciergeChat();

    const triggerBtn = screen.getByRole("button", {
      name: /open gracia fab ai concierge chat/i,
    });
    expect(triggerBtn).toBeInTheDocument();
  });

  it("opens the modal and displays the intro consultation view upon clicking the bubble", () => {
    renderAiConciergeChat();

    fireEvent.click(
      screen.getByRole("button", { name: /open gracia fab ai concierge chat/i })
    );

    expect(screen.getByText(/Personalized Beauty Concierge/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start consultation/i })
    ).toBeInTheDocument();
  });

  it("transitions to active conversation view after clicking Start Consultation", () => {
    renderAiConciergeChat();

    fireEvent.click(
      screen.getByRole("button", { name: /open gracia fab ai concierge chat/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /start consultation/i })
    );

    expect(
      screen.getByText(/Hello! I am your Gracia Fab AI Concierge/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Ask about skincare, wigs, undertones/i)
    ).toBeInTheDocument();
  });

  it("handles offline fallback keyword response when fetch fails", async () => {
    // Force fetch to reject to test offline fallback
    vi.spyOn(window, "fetch").mockRejectedValueOnce(new Error("Network error"));

    renderAiConciergeChat();

    fireEvent.click(
      screen.getByRole("button", { name: /open gracia fab ai concierge chat/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /start consultation/i })
    );

    const input = screen.getByPlaceholderText(/Ask about skincare, wigs, undertones/i);
    fireEvent.change(input, { target: { value: "Tell me about hyperpigmentation" } });

    const sendBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(sendBtn);

    // Verify user message appears
    expect(screen.getByText("Tell me about hyperpigmentation")).toBeInTheDocument();

    // Verify fallback response appears
    await waitFor(() => {
      expect(
        screen.getByText(/For melanin-rich skin facing hyperpigmentation/i)
      ).toBeInTheDocument();
    });
  });

  it("renders recommended product card from API and triggers onCartOpen on Add to Bag", async () => {
    const onCartOpen = vi.fn();
    const mockProduct = {
      _id: "prod-123",
      name: "Radiance Niacinamide Serum",
      price: 18500,
      image: "https://example.com/serum.jpg",
    };

    vi.spyOn(window, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: "Here is our top recommendation for brightening your skin:",
        products: [mockProduct],
      }),
    });

    renderAiConciergeChat({ onCartOpen });

    fireEvent.click(
      screen.getByRole("button", { name: /open gracia fab ai concierge chat/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /start consultation/i })
    );

    const input = screen.getByPlaceholderText(/Ask about skincare, wigs, undertones/i);
    fireEvent.change(input, { target: { value: "I need brightening serum" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Radiance Niacinamide Serum")
      ).toBeInTheDocument();
      expect(screen.getByText("₦18,500")).toBeInTheDocument();
    });

    // Click Add to Bag
    const addToBagBtn = screen.getByRole("button", { name: /\+ add to bag/i });
    fireEvent.click(addToBagBtn);

    expect(onCartOpen).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/Added "Radiance Niacinamide Serum" to your bag/i)
    ).toBeInTheDocument();
  });
});

