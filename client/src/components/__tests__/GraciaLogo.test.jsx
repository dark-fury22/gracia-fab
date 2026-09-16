import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GraciaLogo from "../GraciaLogo";

describe("GraciaLogo", () => {
  it("renders the wordmark by default", () => {
    render(<GraciaLogo />);

    expect(screen.getByText("Gracia")).toBeInTheDocument();
    expect(screen.getByText("FAB")).toBeInTheDocument();
  });

  it("hides the wordmark when showText is false", () => {
    render(<GraciaLogo showText={false} />);

    expect(screen.queryByText("Gracia")).not.toBeInTheDocument();
  });
});
