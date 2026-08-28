import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCardSkeleton } from "../ProductCard";

describe("ProductCardSkeleton", () => {
  it("renders the skeleton placeholder", () => {
    const { container } = render(<ProductCardSkeleton />);

    expect(container.querySelector(".product-card-skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
