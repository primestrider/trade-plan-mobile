import { realizedProfit, rMultiple, type TradePlan } from "./plan";

export type TradeStats = {
  trades: number;
  wins: number;
  /** Rupiah, summed over closed trades. */
  totalProfit: number;
  /** 0–1. */
  winRate: number;
  /** Average result per trade in R — what one more trade is worth. */
  expectancyR: number;
  /** Gross profit over gross loss; `null` while there is no loss to divide by. */
  profitFactor: number | null;
  averageWinR: number | null;
  averageLossR: number | null;
  bestR: number;
  worstR: number;
  /** The deepest fall from a high point of the running total, in rupiah. */
  maxDrawdown: number;
  /**
   * The running total after each closed trade, oldest first, starting from
   * zero before the first: `curve[n]` is the total after trade `n`.
   */
  curve: number[];
};

const average = (values: number[]) =>
  values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;

/** Everything the statistics page shows. `null` before any trade is closed. */
export function tradeStats(plans: readonly TradePlan[]): TradeStats | null {
  const closed = plans
    .filter((plan) => plan.status === "closed" && plan.exitPrice !== null)
    .sort((a, b) => (a.closedAt ?? "").localeCompare(b.closedAt ?? ""));

  if (closed.length === 0) return null;

  const profits = closed.map((plan) => realizedProfit(plan) ?? 0);
  const results = closed.map((plan) => rMultiple(plan) ?? 0);

  const curve = [0];
  let peak = 0;
  let maxDrawdown = 0;
  for (const profit of profits) {
    const total = curve[curve.length - 1] + profit;
    curve.push(total);
    peak = Math.max(peak, total);
    maxDrawdown = Math.max(maxDrawdown, peak - total);
  }

  const grossProfit = profits.filter((p) => p > 0).reduce((s, p) => s + p, 0);
  const grossLoss = -profits.filter((p) => p < 0).reduce((s, p) => s + p, 0);

  return {
    trades: closed.length,
    wins: results.filter((r) => r > 0).length,
    totalProfit: curve[curve.length - 1],
    winRate: results.filter((r) => r > 0).length / closed.length,
    expectancyR: average(results) ?? 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : null,
    averageWinR: average(results.filter((r) => r > 0)),
    averageLossR: average(results.filter((r) => r < 0)),
    bestR: Math.max(...results),
    worstR: Math.min(...results),
    maxDrawdown,
    curve,
  };
}
