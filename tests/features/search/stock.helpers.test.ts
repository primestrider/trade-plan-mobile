import {
  changeTone,
  filterStocks,
  formatChange,
  formatCompactRupiah,
  formatMultiple,
  formatPrice,
} from "@/features/search/helpers/stock";
import type { Stock } from "@/features/search/models/api.model";

import { stockLike } from "./fixtures";

// A–Z, as the API returns them.
const stocks = [
  stockLike("ABBC", "Abadi Bersama Corp Tbk."),
  stockLike("BBCA", "Bank Central Asia Tbk."),
  stockLike("BBCP", "Bumi Berkah Cipta Tbk."),
  stockLike("CENT", "Centratama Telekomunikasi Tbk."),
];

const codes = (list: Stock[]) => list.map((item) => item.Code);

describe("filterStocks", () => {
  it("keeps every stock, in order, while nothing is typed", () => {
    expect(codes(filterStocks(stocks, "  "))).toEqual(codes(stocks));
  });

  it("puts codes that start with the query ahead of codes that only contain it", () => {
    expect(codes(filterStocks(stocks, "bbc"))).toEqual(["BBCA", "BBCP", "ABBC"]);
  });

  it("puts an exact code first", () => {
    expect(codes(filterStocks(stocks, "BBCP"))[0]).toBe("BBCP");
  });

  it("finds a stock by a word of its company name", () => {
    expect(codes(filterStocks(stocks, "central"))).toEqual(["BBCA"]);
  });

  it("ranks a code match above a company-name match", () => {
    expect(codes(filterStocks(stocks, "cent"))).toEqual(["CENT", "BBCA"]);
  });

  it("returns nothing when nothing matches", () => {
    expect(filterStocks(stocks, "ZZZZ")).toEqual([]);
  });
});

describe("formatting", () => {
  it("writes prices as whole rupiah, grouped the Indonesian way", () => {
    expect(formatPrice(6075)).toBe("6.075");
  });

  it("writes a ratio as a signed percentage", () => {
    expect(formatChange(-0.01219512)).toBe("-1,22%");
    expect(formatChange(0.0947, 1)).toBe("+9,5%");
    expect(formatChange(0)).toBe("0,00%");
    expect(formatChange(null)).toBe("-");
  });

  it("writes valuation multiples with two decimals and an x", () => {
    expect(formatMultiple(12.8997)).toBe("12,90x");
    expect(formatMultiple(null)).toBe("-");
  });

  it("abbreviates large rupiah amounts", () => {
    expect(formatCompactRupiah(748895928750000)).toBe("Rp 748,9T");
  });

  it("colors a rise green, a fall red, and no move or no data muted", () => {
    expect(changeTone(0.01)).toBe("success");
    expect(changeTone(-0.01)).toBe("destructive");
    expect(changeTone(0)).toBe("muted");
    expect(changeTone(null)).toBe("muted");
  });
});
