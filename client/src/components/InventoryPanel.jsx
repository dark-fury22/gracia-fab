import { useState, useEffect, useMemo, useCallback } from "react";
import API_URL from "../config";
import { buildInventoryCsv, readInventoryCsv } from "../utils/inventoryCsv";
import "./InventoryPanel.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "out", label: "Out of stock" },
  { id: "in", label: "In stock" },
];

function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    ...extra,
  };
}

// Admin dashboard → Inventory tab. Two ways to enter stock counts:
//  - edit counts inline and save the changed rows in one go
//  - download the sheet, fill it in elsewhere, upload it back
// Both go through PUT /api/admin/products/stock.
function InventoryPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [edits, setEdits] = useState({}); // productId -> string as typed
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [upload, setUpload] = useState(null); // parsed CSV awaiting confirmation

  // `loading` starts true and only matters for the first load; refreshes after
  // a save keep the table on screen.
  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Couldn't load products");
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch-orchestration effect: loadProducts only sets state after its
    // request resolves; the rule can't see past the async call boundary.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, [loadProducts]);

  const outOfStockCount = products.filter((p) => !(p.stock > 0)).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) =>
        filter === "out" ? !(p.stock > 0) : filter === "in" ? p.stock > 0 : true,
      )
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, filter, query]);

  // Rows whose typed value is a valid whole number different from the saved one.
  const pending = Object.entries(edits)
    .filter(([id, value]) => {
      const product = products.find((p) => p._id === id);
      return product && /^\d+$/.test(value) && Number(value) !== product.stock;
    })
    .map(([id, value]) => ({ id, stock: Number(value) }));
  const invalidEdits = Object.values(edits).filter(
    (v) => v !== "" && !/^\d+$/.test(v),
  ).length;

  const saveUpdates = async (updates) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`${API_URL}/api/admin/products/stock`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Couldn't save stock");
      setNotice(
        `Saved stock for ${data.updated} product${data.updated === 1 ? "" : "s"}.` +
          (data.notFound?.length
            ? ` ${data.notFound.length} row(s) no longer match a product and were skipped.`
            : ""),
      );
      setEdits({});
      setUpload(null);
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([buildInventoryCsv(products)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gracia-fab-stock-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setError("");
    setNotice("");
    const result = readInventoryCsv(await file.text(), products);
    if (result.error) {
      setError(result.error);
      return;
    }
    setUpload({ ...result, fileName: file.name });
  };

  if (loading && products.length === 0) {
    return <p className="admin-loading">Loading inventory...</p>;
  }

  return (
    <div className="admin-content inventory">
      <div className="inventory-intro">
        <div>
          <h2>Inventory</h2>
          <p>
            {products.length} products ·{" "}
            <strong>{outOfStockCount} out of stock</strong>. Products with no
            count are out of stock and can't be bought until one is entered.
          </p>
        </div>
        <div className="inventory-sheet-actions">
          <button
            type="button"
            className="btn-admin-cancel"
            onClick={handleDownload}
            disabled={products.length === 0}
          >
            ⬇ Download stock sheet
          </button>
          <label className="btn-admin-cancel inventory-upload">
            ⬆ Upload filled sheet
            <input type="file" accept=".csv,text/csv" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {error && <div className="admin-error">⚠️ {error}</div>}
      {notice && <div className="admin-success">✅ {notice}</div>}

      {upload && (
        <div className="inventory-upload-preview" role="region" aria-label="Sheet upload preview">
          <p>
            <strong>{upload.fileName}</strong>: {upload.updates.length} stock
            change{upload.updates.length === 1 ? "" : "s"}
            {upload.unchanged > 0 && `, ${upload.unchanged} unchanged`}
            {upload.skipped.length > 0 && `, ${upload.skipped.length} skipped`}.
            Blank stock cells are left as they are.
          </p>
          {upload.skipped.length > 0 && (
            <ul>
              {upload.skipped.slice(0, 10).map((s) => (
                <li key={s.line}>
                  Row {s.line}: {s.reason}
                </li>
              ))}
              {upload.skipped.length > 10 && (
                <li>…and {upload.skipped.length - 10} more</li>
              )}
            </ul>
          )}
          <div className="admin-form-actions">
            <button
              type="button"
              className="btn-admin-save"
              disabled={saving || upload.updates.length === 0}
              onClick={() => saveUpdates(upload.updates)}
            >
              {saving ? "Saving..." : `Apply ${upload.updates.length} change${upload.updates.length === 1 ? "" : "s"}`}
            </button>
            <button
              type="button"
              className="btn-admin-cancel"
              onClick={() => setUpload(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="inventory-toolbar">
        <div className="inventory-filters" role="group" aria-label="Filter by stock">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`inventory-filter ${filter === f.id ? "active" : ""}`}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="inventory-search"
          placeholder="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <button
          type="button"
          className="btn-admin-save"
          disabled={saving || pending.length === 0 || invalidEdits > 0}
          onClick={() => saveUpdates(pending)}
        >
          {saving
            ? "Saving..."
            : pending.length === 0
              ? "No changes"
              : `Save ${pending.length} change${pending.length === 1 ? "" : "s"}`}
        </button>
      </div>
      {invalidEdits > 0 && (
        <p className="inventory-hint">Stock must be a whole number (0 or more).</p>
      )}

      <table className="admin-table inventory-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((product) => {
            const value = edits[product._id] ?? String(product.stock ?? 0);
            const dirty =
              edits[product._id] !== undefined &&
              edits[product._id] !== String(product.stock ?? 0);
            const invalid = value !== "" && !/^\d+$/.test(value);
            return (
              <tr key={product._id} className={dirty ? "is-dirty" : ""}>
                <td className="product-name-cell">
                  <p>{product.name}</p>
                  {product.brand && <span>{product.brand}</span>}
                </td>
                <td>
                  <span className="category-pill">{product.category}</span>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    className={`inventory-stock-input ${invalid ? "invalid" : ""}`}
                    value={value}
                    aria-label={`Stock for ${product.name}`}
                    onChange={(e) =>
                      setEdits((prev) => ({
                        ...prev,
                        [product._id]: e.target.value,
                      }))
                    }
                  />
                </td>
                <td>
                  {product.stock > 0 ? (
                    <span className="inventory-status in">In stock</span>
                  ) : (
                    <span className="inventory-status out">Out of stock</span>
                  )}
                </td>
              </tr>
            );
          })}
          {visible.length === 0 && (
            <tr>
              <td colSpan={4} className="inventory-empty">
                No products match.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryPanel;
