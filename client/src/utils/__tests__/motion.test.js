import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { startMotion } from "../motion";

let observed;
let callback;

class FakeIntersectionObserver {
  constructor(cb) {
    callback = cb;
    this.targets = new Set();
  }
  observe(el) {
    observed.add(el);
    this.targets.add(el);
  }
  unobserve(el) {
    this.targets.delete(el);
  }
  disconnect() {
    for (const el of this.targets) observed.delete(el);
    this.targets.clear();
  }
}

describe("startMotion", () => {
  beforeEach(() => {
    observed = new Set();
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    window.matchMedia = vi.fn(() => ({ matches: false }));
    document.body.innerHTML = `
      <div class="glow-products-grid">
        ${Array.from({ length: 6 }, () => '<article class="glow-product-card"></article>').join("")}
      </div>
      <aside class="glow-filter-sidebar"></aside>`;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.classList.remove("motion-ready");
  });

  it("tags cards with varied directions and staggered delays", () => {
    const stop = startMotion();
    const cards = [...document.querySelectorAll(".glow-product-card")];

    expect(new Set(cards.map((c) => c.dataset.reveal)).size).toBeGreaterThan(3);
    expect(cards[0].style.getPropertyValue("--reveal-delay")).toBe("0ms");
    expect(cards[2].style.getPropertyValue("--reveal-delay")).toBe("140ms");
    expect(document.querySelector(".glow-filter-sidebar").dataset.reveal).toBe("left");
    expect(document.documentElement.classList.contains("motion-ready")).toBe(true);
    stop();
  });

  it("reveals an element when it scrolls into view", () => {
    const stop = startMotion();
    const card = document.querySelector(".glow-product-card");
    callback([{ target: card, isIntersecting: true }]);
    expect(card.classList.contains("is-revealed")).toBe(true);
    stop();
  });

  it("re-observes already-tagged elements after a restart (StrictMode)", () => {
    startMotion()();
    startMotion();
    const cards = [...document.querySelectorAll(".glow-product-card")];
    expect(cards.every((c) => observed.has(c))).toBe(true);
  });

  it("does nothing for visitors who prefer reduced motion", () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    startMotion();
    expect(document.querySelector("[data-reveal]")).toBeNull();
    expect(document.documentElement.classList.contains("motion-ready")).toBe(false);
  });
});
