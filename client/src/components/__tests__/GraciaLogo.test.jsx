import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../context/ThemeContext";
import GraciaLogo from "../GraciaLogo";

describe("GraciaLogo", () => {
  it("renders the wordmark by default", () => {
    render(
      <ThemeProvider>
        <GraciaLogo />
      </ThemeProvider>,
    );

    expect(screen.getByText("Gracia")).toBeInTheDocument();
    expect(screen.getByText("FAB")).toBeInTheDocument();
  });

  it("hides the wordmark when showText is false", () => {
    render(
      <ThemeProvider>
        <GraciaLogo showText={false} />
      </ThemeProvider>,
    );

    expect(screen.queryByText("Gracia")).not.toBeInTheDocument();
  });
});
