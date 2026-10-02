import { realizedProfit, rMultiple, type TradePlan } from "./plan";

export type Cell = string | number | null;

/** Column names, kept machine-friendly so formulas and scripts can use them. */
export const TRADE_LOG_COLUMNS = [
  "code",
  "name",
  "status",
  "entry",
  "stop_loss",
  "target",
  "lots",
  "exit",
  "profit_rp",
  "r_multiple",
  "created_at",
  "opened_at",
  "closed_at",
  "note",
] as const;

/**
 * The trade log as a table — a header row, then one row per plan, oldest
 * first. Shared by the CSV export and the Google Sheets sync, so a file and
 * the sheet always hold the same columns.
 */
export function tradeLogTable(plans: readonly TradePlan[]): Cell[][] {
  const rows = [...plans]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((plan): Cell[] => {
      const r = rMultiple(plan);

      return [
        plan.code,
        plan.name,
        plan.status,
        plan.entry,
        plan.stopLoss,
        plan.target,
        plan.lots,
        plan.exitPrice,
        realizedProfit(plan),
        r === null ? null : Math.round(r * 100) / 100,
        plan.createdAt,
        plan.openedAt,
        plan.closedAt,
        plan.note,
      ];
    });

  return [[...TRADE_LOG_COLUMNS], ...rows];
}
