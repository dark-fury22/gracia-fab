import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Recommend from "../Recommend";
import { CartProvider } from "../../context/CartContext";
import { ToastProvider } from "../../components/Toast";
import { BeautyProfileProvider } from "../../context/BeautyProfileContext";
import { AuthContext } from "../../hooks/useAuth";

function renderRecommend(props = {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <AuthContext.Provider value={{ user: null, loading: false }}>
          <ToastProvider>
            <CartProvider>
              <BeautyProfileProvider>
                <Recommend {...props} />
              </BeautyProfileProvider>
            </CartProvider>
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe("Recommend (AI Beauty Advisor Page)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the flagship hero section and value props", () => {
    renderRecommend();

    expect(
      screen.getByRole("heading", { name: /your personal beauty expert/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start your beauty consultation/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Personalized")).toBeInTheDocument();
    expect(screen.getByText("Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Expert Beauty Advice")).toBeInTheDocument();
  });

  it("renders the 4 interactive intent action tiles", () => {
    renderRecommend();

    expect(screen.getByText(/find the right skincare/i)).toBeInTheDocument();
    expect(screen.getByText(/get a makeup/i)).toBeInTheDocument();
    expect(screen.getByText(/build a complete/i)).toBeInTheDocument();
    expect(screen.getByText(/explore haircare/i)).toBeInTheDocument();
  });

  it("renders the personalized 4-step routine with Naira pricing and handles Add to Cart", () => {
    const onCartOpen = vi.fn();
    renderRecommend({ onCartOpen, initialStep: 5 });

    expect(screen.getByText(/Hydrating Face Cleanser/i)).toBeInTheDocument();
    expect(screen.getByText("₦18,000")).toBeInTheDocument();
    expect(screen.getByText(/Glow Balancing Toner/i)).toBeInTheDocument();
    expect(screen.getByText("₦16,500")).toBeInTheDocument();

    // Click Add to Cart on the first routine product
    const addBtns = screen.getAllByRole("button", { name: /add to cart ↗/i });
    fireEvent.click(addBtns[0]);

    expect(onCartOpen).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/added "hydrating face cleanser" to your bag/i)
    ).toBeInTheDocument();
  });

  it("adds the entire 4-step routine to cart at once", () => {
    const onCartOpen = vi.fn();
    renderRecommend({ onCartOpen, initialStep: 5 });

    const addAllBtn = screen.getByRole("button", {
      name: /\+ add all/i,
    });
    fireEvent.click(addAllBtn);

    expect(onCartOpen).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/added complete 4-step routine/i)
    ).toBeInTheDocument();
  });

  it("renders the Live African Undertone banner and opens the camera detector modal", () => {
    navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    };

    renderRecommend({ initialStep: 4 });

    // Check quickbanner
    expect(screen.getByText("Live African Undertone Detection")).toBeInTheDocument();
    expect(screen.getAllByText(/Warm Golden/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rich Neutral/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Deep Espresso/i).length).toBeGreaterThan(0);

    // Click snap selfie button to open modal
    const snapBtn = screen.getByRole("button", {
      name: /📸 snap undertone selfie ✦/i,
    });
    fireEvent.click(snapBtn);

    expect(
      screen.getByText("African Melanin & Undertone Analysis")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Center face inside the oval/i)
    ).toBeInTheDocument();
  });

  it("navigates forward through consultation steps", () => {
    renderRecommend();

    // Starts on Step 1
    expect(screen.getByText(/Step 01 \/ Beauty Focus/i)).toBeInTheDocument();

    // Advance to Step 2
    fireEvent.click(screen.getByRole("button", { name: /start your beauty consultation/i }));
    expect(screen.getByText(/Step 02 \/ Skin & Hair Profile/i)).toBeInTheDocument();

    // Advance to Step 3
    fireEvent.click(screen.getByRole("button", { name: /continue to climate concerns/i }));
    expect(screen.getByText(/Step 03 \/ Climate Concerns/i)).toBeInTheDocument();
  });
});

