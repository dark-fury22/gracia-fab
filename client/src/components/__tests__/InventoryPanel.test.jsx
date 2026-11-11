import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InventoryPanel from "../InventoryPanel";

const products = [
  { _id: "a".repeat(24), name: "Argan Oil", category: "skincare", stock: 0 },
  { _id: "b".repeat(24), name: "Body Wave Wig", category: "wig", stock: 4 },
];

describe("InventoryPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.fetch = vi.fn(async (url, opts = {}) => ({
      ok: true,
      json: async () =>
        opts.method === "PUT" ? { updated: 1, notFound: [] } : products,
    }));
  });

  it("shows how many products are out of stock", async () => {
    render(<InventoryPanel />);
    expect(await screen.findByText(/1 out of stock/i)).toBeInTheDocument();
  });

  it("saves only the changed rows", async () => {
    render(<InventoryPanel />);

    const input = await screen.findByLabelText(/stock for argan oil/i);
    fireEvent.change(input, { target: { value: "12" } });

    fireEvent.click(screen.getByRole("button", { name: /save 1 change/i }));

    await waitFor(() =>
      expect(window.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/products/stock"),
        expect.objectContaining({ method: "PUT" }),
      ),
    );
    const putCall = window.fetch.mock.calls.find(([, o]) => o?.method === "PUT");
    expect(JSON.parse(putCall[1].body)).toEqual({
      updates: [{ id: "a".repeat(24), stock: 12 }],
    });
  });

  it("blocks saving a value that isn't a whole number", async () => {
    render(<InventoryPanel />);

    const input = await screen.findByLabelText(/stock for body wave wig/i);
    fireEvent.change(input, { target: { value: "2.5" } });

    expect(screen.getByText(/must be a whole number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no changes/i })).toBeDisabled();
  });
});
