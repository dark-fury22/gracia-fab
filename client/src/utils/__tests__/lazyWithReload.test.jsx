import { describe, it, expect, beforeEach, vi } from "vitest";
import { Suspense } from "react";
import { render, screen } from "@testing-library/react";
import lazyWithReload from "../lazyWithReload";
import ErrorBoundary from "../../components/ErrorBoundary";

describe("lazyWithReload", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload: vi.fn() },
    });
  });

  function renderLazy(factory) {
    const Page = lazyWithReload(factory);
    return render(
      <ErrorBoundary>
        <Suspense fallback={<p>loading</p>}>
          <Page />
        </Suspense>
      </ErrorBoundary>,
    );
  }

  it("renders the page when its code loads", async () => {
    renderLazy(async () => ({ default: () => <p>admin page</p> }));
    expect(await screen.findByText("admin page")).toBeInTheDocument();
  });

  it("reloads once when the page's code file is missing (stale deploy)", async () => {
    renderLazy(() => Promise.reject(new TypeError("Failed to fetch dynamically imported module")));
    await vi.waitFor(() => expect(window.location.reload).toHaveBeenCalledTimes(1));
  });

  it("shows a message instead of a blank page if it still fails after reloading", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    sessionStorage.setItem("gf-chunk-reload", "1"); // already reloaded once
    renderLazy(() => Promise.reject(new TypeError("Failed to fetch dynamically imported module")));

    expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
    expect(window.location.reload).not.toHaveBeenCalled();
  });
});
