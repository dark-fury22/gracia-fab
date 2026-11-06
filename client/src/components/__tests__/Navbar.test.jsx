import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../Navbar";

let mockUser = null;
const mockLogout = vi.fn();
const mockCartItems = [{ _id: "p1", name: "Glow Serum", quantity: 2 }];
const mockOnCartOpen = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
    loading: false,
  }),
}));

vi.mock("../../hooks/useCart", () => ({
  useCart: () => ({
    cartItems: mockCartItems,
  }),
}));

describe("Navbar Component & Mobile Drawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
  });

  const renderNavbar = (props = {}) => {
    return render(
      <MemoryRouter>
        <Navbar onCartOpen={mockOnCartOpen} {...props} />
      </MemoryRouter>,
    );
  };

  it("renders primary navbar desktop links and utilities", () => {
    renderNavbar();

    expect(screen.getAllByRole("link", { name: "HOME" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("link", { name: "BEAUTY ADVISOR" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("link", { name: "SHOP" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("link", { name: "ABOUT" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: /ACCOUNT/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open Cart/i })).toBeInTheDocument();
  });

  it("toggles the mobile side-menu drawer open and closed", () => {
    renderNavbar();

    const mobileToggle = screen.getByRole("button", { name: /Toggle navigation menu/i });
    expect(screen.queryByRole("navigation", { name: "Mobile Navigation" })).not.toBeInTheDocument();

    fireEvent.click(mobileToggle);
    expect(screen.getByRole("navigation", { name: "Mobile Navigation" })).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Close navigation menu/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("navigation", { name: "Mobile Navigation" })).not.toBeInTheDocument();
  });

  it("only shows what is on the navbar in the side-menu drawer (no cluttered category lists, AI lab or services)", () => {
    renderNavbar();

    // Open mobile side-menu
    const mobileToggle = screen.getByRole("button", { name: /Toggle navigation menu/i });
    fireEvent.click(mobileToggle);

    const mobileNav = screen.getByRole("navigation", { name: "Mobile Navigation" });
    expect(mobileNav).toBeInTheDocument();

    // Primary items present matching navbar
    expect(screen.getAllByRole("link", { name: "HOME" }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("link", { name: "BEAUTY ADVISOR" }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("link", { name: "SHOP" }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("link", { name: "ABOUT" }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("link", { name: "ACCOUNT" }).length).toBeGreaterThanOrEqual(2);

    // Cart trigger in mobile drawer
    const drawerCartBtn = screen.getByRole("button", { name: /Open Cart, 2 items/i });
    expect(drawerCartBtn).toBeInTheDocument();

    // Clutter removed: verify removed sections and links do not exist
    expect(screen.queryByText(/SHOP BY CATEGORY/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/AI BEAUTY LAB/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SERVICES & ACCOUNT/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Customer Concierge/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/AI Skin Analysis/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Skin Tone Detector/i)).not.toBeInTheDocument();
  });

  it("handles mobile cart drawer opening and menu closing", () => {
    renderNavbar();

    const mobileToggle = screen.getByRole("button", { name: /Toggle navigation menu/i });
    fireEvent.click(mobileToggle);

    const drawerCartBtn = screen.getByRole("button", { name: /Open Cart, 2 items/i });
    fireEvent.click(drawerCartBtn);

    expect(mockOnCartOpen).toHaveBeenCalled();
    // Drawer should close after clicking cart
    expect(screen.queryByRole("navigation", { name: "Mobile Navigation" })).not.toBeInTheDocument();
  });

  it("displays Account and Sign Out when authenticated in mobile side-menu", () => {
    mockUser = {
      _id: "user123",
      name: "Ada Lovelace",
      email: "ada@example.com",
      isAdmin: false,
    };

    renderNavbar();

    const mobileToggle = screen.getByRole("button", { name: /Toggle navigation menu/i });
    fireEvent.click(mobileToggle);

    expect(screen.getAllByRole("link", { name: "ACCOUNT" }).length).toBeGreaterThanOrEqual(1);
    const signOutBtn = screen.getByRole("button", { name: /SIGN OUT/i });
    expect(signOutBtn).toBeInTheDocument();

    fireEvent.click(signOutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });
});

