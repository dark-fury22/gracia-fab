import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LiveCameraToneDetector from "../LiveCameraToneDetector";
import {
  classifyAfricanComplexion,
  AFRICAN_UNDERTONES,
} from "../../utils/africanUndertones";
import { BeautyProfileProvider } from "../../context/BeautyProfileContext";
import { ToastProvider } from "../Toast";

describe("LiveCameraToneDetector - African Undertone Detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("classifyAfricanComplexion math", () => {
    it("correctly identifies Deep Espresso for deep melanin complexions", () => {
      // Very deep melanin (low lightness, e.g. L = 34, B = 8)
      const res = classifyAfricanComplexion(34, 8, 8);
      expect(res.undertoneKey).toBe("deep-espresso");
      expect(res.undertone).toBe("Deep Espresso");
      expect(res.foundationMatch).toContain("Deep Espresso");
    });

    it("correctly identifies Warm Golden for golden-yellow reflective complexions", () => {
      // Golden caramel melanin (e.g. L = 50, A = 12, B = 20)
      const res = classifyAfricanComplexion(50, 12, 20);
      expect(res.undertoneKey).toBe("warm-golden");
      expect(res.undertone).toBe("Warm Golden");
      expect(res.foundationMatch).toContain("Warm Golden Honey");
    });

    it("correctly identifies Rich Neutral for balanced red-yellow melanin complexions", () => {
      // Balanced mahogany melanin (e.g. L = 46, A = 14, B = 10)
      const res = classifyAfricanComplexion(46, 14, 10);
      expect(res.undertoneKey).toBe("rich-neutral");
      expect(res.undertone).toBe("Rich Neutral");
      expect(res.foundationMatch).toContain("Rich Neutral Cocoa");
    });
  });

  describe("Modal UI & Undertone Selection", () => {
    it("does not render when isOpen is false", () => {
      render(
        <ToastProvider>
          <BeautyProfileProvider>
            <LiveCameraToneDetector isOpen={false} onClose={vi.fn()} onDetected={vi.fn()} />
          </BeautyProfileProvider>
        </ToastProvider>
      );

      expect(screen.queryByText(/African Melanin & Undertone Analysis/i)).not.toBeInTheDocument();
    });

    it("renders modal with header and face guide when live camera is available", () => {
      const mockStream = {
        getTracks: () => [{ stop: vi.fn() }],
      };
      navigator.mediaDevices = {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      };

      render(
        <ToastProvider>
          <BeautyProfileProvider>
            <LiveCameraToneDetector isOpen={true} onClose={vi.fn()} onDetected={vi.fn()} />
          </BeautyProfileProvider>
        </ToastProvider>
      );

      expect(screen.getByText(/African Melanin & Undertone Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/Center face inside the oval/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /snap selfie photo/i })).toBeInTheDocument();
    });

    it("renders fallback upload option when camera is not supported", () => {
      delete navigator.mediaDevices;

      render(
        <ToastProvider>
          <BeautyProfileProvider>
            <LiveCameraToneDetector isOpen={true} onClose={vi.fn()} onDetected={vi.fn()} />
          </BeautyProfileProvider>
        </ToastProvider>
      );

      expect(screen.getByText(/Upload a Selfie/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /choose photo from library/i })).toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", () => {
      const onClose = vi.fn();
      render(
        <ToastProvider>
          <BeautyProfileProvider>
            <LiveCameraToneDetector isOpen={true} onClose={onClose} onDetected={vi.fn()} />
          </BeautyProfileProvider>
        </ToastProvider>
      );

      const closeBtn = screen.getByRole("button", { name: /close tone detector/i });
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("has all 3 African undertone configurations defined", () => {
      expect(AFRICAN_UNDERTONES["warm-golden"].name).toBe("Warm Golden");
      expect(AFRICAN_UNDERTONES["rich-neutral"].name).toBe("Rich Neutral");
      expect(AFRICAN_UNDERTONES["deep-espresso"].name).toBe("Deep Espresso");
    });
  });
});

