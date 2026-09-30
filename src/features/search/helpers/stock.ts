import { formatCompactNumber, formatNumber } from "@/shared/helpers";

import type { Stock } from "../models/api.model";

/**
 * Narrows the list to what the query could mean, best guess first.
 *
 * Traders mostly type the four-letter code, so a code that matches exactly or
 * begins with the query outranks a company whose name merely contains it —
 * "BBC" should put BBCA at the top, not every name with "bbc" in the middle.
 * Within a rank the list keeps the API's A–Z order.
 */
export function filterStocks(stocks: readonly Stock[], query: string): Stock[] {
  const needle = query.trim().toUpperCase();

  if (!needle) return [...stocks];

  const rankOf = (stock: Stock): number => {
    const code = stock.Code.toUpperCase();
    const name = stock.Name.toUpperCase();

    if (code === needle) return 0;
    if (code.startsWith(needle)) return 1;
    if (name.split(/\s+/).some((word) => word.startsWith(needle))) return 2;
    if (code.includes(needle) || name.includes(needle)) return 3;

    return -1;
  };

  return stocks
    .map((stock, index) => ({ stock, index, rank: rankOf(stock) }))
    .filter((entry) => entry.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.stock);
}

/** Rupiah prices are whole numbers, grouped the Indonesian way. */
export function formatPrice(value: number): string {
  return formatNumber(value, { language: "id", maximumFractionDigits: 0 });
}

/** A ratio as a signed percentage: `-0.0122` → `-1,22%`, zero unsigned. */
export function formatChange(ratio: number | null, fractionDigits = 2): string {
  if (ratio === null) return "-";

  return `${formatNumber(ratio * 100, {
    language: "id",
    signDisplay: "exceptZero",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
}

/** A valuation multiple such as PER or PBR: `12.8997` → `12,90x`. */
export function formatMultiple(value: number | null): string {
  if (value === null) return "-";

  return `${formatNumber(value, {
    language: "id",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}x`;
}

/** A large rupiah amount, abbreviated: `748895928750000` → `Rp 748,9T`. */
export function formatCompactRupiah(value: number): string {
  return `Rp ${formatCompactNumber(value, { language: "id" })}`;
}

/** Which text color a change reads in. */
export function changeTone(
  ratio: number | null,
): "success" | "destructive" | "muted" {
  if (!ratio) return "muted";

  return ratio > 0 ? "success" : "destructive";
}
