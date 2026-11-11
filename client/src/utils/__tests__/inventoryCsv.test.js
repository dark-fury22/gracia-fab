import { describe, it, expect } from "vitest";
import {
  buildInventoryCsv,
  parseCsv,
  readInventoryCsv,
} from "../inventoryCsv";

const products = [
  { _id: "a".repeat(24), name: "Argan Oil, 7 Days SPF50", category: "skincare", stock: 0 },
  { _id: "b".repeat(24), name: 'The "Best" Wig', category: "wig", stock: 4 },
  { _id: "c".repeat(24), name: "Shea Butter", category: "skincare", stock: 10 },
];

describe("inventory CSV", () => {
  it("round-trips names containing commas and quotes", () => {
    const csv = buildInventoryCsv(products);
    const rows = parseCsv(csv);
    expect(rows[0]).toEqual(["id", "name", "category", "stock"]);
    expect(rows[1][1]).toBe("Argan Oil, 7 Days SPF50");
    expect(rows[2][1]).toBe('The "Best" Wig');
  });

  it("turns filled-in stock cells into updates and skips blanks", () => {
    const csv = [
      "id,name,category,stock",
      `${"a".repeat(24)},"Argan Oil, 7 Days SPF50",skincare,12`,
      `${"b".repeat(24)},"The ""Best"" Wig",wig,`,
      `${"c".repeat(24)},Shea Butter,skincare,10`,
    ].join("\n");

    const result = readInventoryCsv(csv, products);
    expect(result.updates).toEqual([{ id: "a".repeat(24), stock: 12 }]);
    expect(result.unchanged).toBe(1);
    expect(result.skipped).toEqual([]);
  });

  it("falls back to matching by name when the id is missing", () => {
    const csv = "name,stock\nshea butter,3\n";
    expect(readInventoryCsv(csv, products).updates).toEqual([
      { id: "c".repeat(24), stock: 3 },
    ]);
  });

  it("reports bad numbers, unknown products and duplicates", () => {
    const csv = [
      "id,name,stock",
      `${"a".repeat(24)},x,2.5`,
      `${"d".repeat(24)},Nope,3`,
      `${"c".repeat(24)},x,-1`,
      `${"b".repeat(24)},x,6`,
      `${"b".repeat(24)},x,7`,
    ].join("\r\n");

    const { updates, skipped } = readInventoryCsv(csv, products);
    expect(updates).toEqual([{ id: "b".repeat(24), stock: 6 }]);
    expect(skipped.map((s) => s.line)).toEqual([2, 3, 4, 6]);
  });

  it("explains a sheet without the needed columns", () => {
    expect(readInventoryCsv("foo,bar\n1,2", products).error).toMatch(/stock/);
  });
});
