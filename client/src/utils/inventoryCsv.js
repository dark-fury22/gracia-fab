// CSV helpers for the admin Inventory tab: download a stock sheet, fill it in
// (Excel / Google Sheets / Numbers), upload it back.
//
// Columns: id, name, category, stock. Rows are matched by id; name and
// category are there so a person can tell which product is which (and as a
// fallback match by exact name if the id cell was mangled).

const BOM = String.fromCharCode(0xfeff);
const BOM_RE = new RegExp(`^${BOM}`);
const HEADER = ["id", "name", "category", "stock"];

function escapeCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildInventoryCsv(products) {
  const rows = products.map((p) => [p._id, p.name, p.category, p.stock ?? ""]);
  // A byte-order mark (BOM) so Excel opens it as UTF-8 and keeps characters like ₦ and ×.
  return (
    BOM +
    [HEADER, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n") +
    "\r\n"
  );
}

// Minimal RFC 4180 parser: quoted fields, escaped quotes (""), commas and
// newlines inside quotes, CRLF or LF line endings.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(BOM_RE, "");

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

// Turns an uploaded sheet into stock updates against the current products.
// Returns { updates: [{ id, stock }], unchanged, skipped: [{ line, reason }] }.
// Blank stock cells are skipped (not zeroed), so a half-filled sheet only
// changes what was actually filled in.
export function readInventoryCsv(text, products) {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { updates: [], unchanged: 0, skipped: [], error: "The file is empty." };
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idCol = header.indexOf("id");
  const nameCol = header.indexOf("name");
  const stockCol = header.indexOf("stock");
  if (stockCol === -1 || (idCol === -1 && nameCol === -1)) {
    return {
      updates: [],
      unchanged: 0,
      skipped: [],
      error:
        'The file needs a "stock" column and an "id" or "name" column. Start from the downloaded sheet.',
    };
  }

  const byId = new Map(products.map((p) => [String(p._id), p]));
  const byName = new Map(
    products.map((p) => [p.name.trim().toLowerCase(), p]),
  );

  const updates = [];
  const skipped = [];
  const seen = new Set();
  let unchanged = 0;

  rows.slice(1).forEach((row, index) => {
    const line = index + 2; // 1-based, after the header
    const rawStock = (row[stockCol] ?? "").trim();
    if (rawStock === "") return;

    const product =
      (idCol !== -1 && byId.get((row[idCol] ?? "").trim())) ||
      (nameCol !== -1 && byName.get((row[nameCol] ?? "").trim().toLowerCase()));

    if (!product) {
      skipped.push({ line, reason: "No matching product" });
      return;
    }
    if (!/^\d+$/.test(rawStock)) {
      skipped.push({
        line,
        reason: `"${rawStock}" isn't a whole number (${product.name})`,
      });
      return;
    }
    const id = String(product._id);
    if (seen.has(id)) {
      skipped.push({ line, reason: `Duplicate row for ${product.name}` });
      return;
    }
    seen.add(id);

    const stock = Number(rawStock);
    if (stock === product.stock) {
      unchanged += 1;
      return;
    }
    updates.push({ id, stock });
  });

  return { updates, unchanged, skipped };
}
