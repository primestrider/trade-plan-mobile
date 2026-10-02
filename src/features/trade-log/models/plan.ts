import { maxLossPerTrade } from "@/shared/stores";

/** IDX trades in lots of 100 shares. */
export const SHARES_PER_LOT = 100;

/**
 * Ceiling on the risk carried by every open position together, in percent of
 * capital. A common companion to the per-trade limit: a handful of positions
 * at 2% each can still stop out on the same bad day.
 */
export const MAX_OPEN_RISK_PERCENT = 6;

/**
 * Where a plan is in its life: written down, bought, or sold again.
 * Only long trades — retail accounts on IDX do not short.
 */
export type PlanStatus = "planned" | "open" | "closed";

export type TradePlan = {
  id: string;
  /** Exchange code, e.g. `BBCA`. */
  code: string;
  /** Company name when the stock list knew it, else empty. */
  name: string;
  entry: number;
  stopLoss: number;
  /** Optional: not every plan sets a take-profit up front. */
  target: number | null;
  lots: number;
  status: PlanStatus;
  /** ISO timestamps. */
  createdAt: string;
  openedAt: string | null;
  closedAt: string | null;
  exitPrice: number | null;
  /** Why the trade, written with the plan. Empty when the user wrote none. */
  note: string;
};

/** The prices a user types in; everything else is worked out from them. */
export type PlanPrices = Pick<TradePlan, "entry" | "stopLoss" | "target">;

export type PositionSize = {
  lots: number;
  /** Rupiah the position costs at the entry price. */
  cost: number;
  /** Rupiah lost if the stop loss is hit. */
  risk: number;
  /** The per-trade limit the size was worked out against. */
  maxLoss: number;
  /** True when the capital, not the risk limit, capped the size. */
  limitedByCapital: boolean;
};

/**
 * The most lots the plan may hold: as many as fit under the per-trade loss
 * limit, and never more than the capital can pay for.
 *
 * Returns `null` while the prices cannot describe a long trade yet (no entry,
 * or a stop loss at or above it).
 */
export function sizePosition(
  { entry, stopLoss }: Pick<TradePlan, "entry" | "stopLoss">,
  balance: number,
  riskPercent: number,
): PositionSize | null {
  const riskPerShare = entry - stopLoss;

  if (!(entry > 0) || !(stopLoss > 0) || !(riskPerShare > 0)) return null;

  const maxLoss = maxLossPerTrade(balance, riskPercent);
  const byRisk = Math.floor(maxLoss / (riskPerShare * SHARES_PER_LOT));
  const byCapital = Math.floor(balance / (entry * SHARES_PER_LOT));
  const lots = Math.max(0, Math.min(byRisk, byCapital));

  return {
    lots,
    cost: lots * SHARES_PER_LOT * entry,
    risk: lots * SHARES_PER_LOT * riskPerShare,
    maxLoss,
    limitedByCapital: byCapital < byRisk,
  };
}

/** Rupiah lost if this plan's stop loss is hit. */
export function planRisk(plan: TradePlan): number {
  return (plan.entry - plan.stopLoss) * plan.lots * SHARES_PER_LOT;
}

/** Reward per unit of risk to the target, e.g. `2` for 1:2. */
export function rewardRatio(prices: PlanPrices): number | null {
  const risk = prices.entry - prices.stopLoss;

  if (prices.target === null || !(risk > 0)) return null;

  return (prices.target - prices.entry) / risk;
}

/** Rupiah gained (or lost, negative) on a closed plan. */
export function realizedProfit(plan: TradePlan): number | null {
  if (plan.exitPrice === null) return null;

  return (plan.exitPrice - plan.entry) * plan.lots * SHARES_PER_LOT;
}

/** The result in units of the risk taken: `-1` is a clean stop-out. */
export function rMultiple(plan: TradePlan): number | null {
  const risk = plan.entry - plan.stopLoss;

  if (plan.exitPrice === null || !(risk > 0)) return null;

  return (plan.exitPrice - plan.entry) / risk;
}

export type OpenRisk = { positions: number; amount: number };

/** What every bought-but-not-sold position stands to lose together. */
export function openRisk(plans: readonly TradePlan[]): OpenRisk {
  const open = plans.filter((plan) => plan.status === "open");

  return {
    positions: open.length,
    amount: open.reduce((sum, plan) => sum + planRisk(plan), 0),
  };
}

export type Performance = {
  trades: number;
  wins: number;
  /** 0–1. */
  winRate: number;
  averageR: number;
  /** Losses in a row, counted back from the latest closed trade. */
  lossStreak: number;
};

/** How the closed trades went. `null` until at least one is closed. */
export function performance(plans: readonly TradePlan[]): Performance | null {
  const closed = plans
    .filter((plan) => plan.status === "closed" && plan.exitPrice !== null)
    .sort((a, b) => (a.closedAt ?? "").localeCompare(b.closedAt ?? ""));

  if (closed.length === 0) return null;

  const results = closed.map((plan) => rMultiple(plan) ?? 0);
  const wins = results.filter((r) => r > 0).length;

  let lossStreak = 0;
  for (let i = results.length - 1; i >= 0 && results[i] < 0; i--) {
    lossStreak += 1;
  }

  return {
    trades: closed.length,
    wins,
    winRate: wins / closed.length,
    averageR: results.reduce((sum, r) => sum + r, 0) / closed.length,
    lossStreak,
  };
}

/** Newest first: the order every plan list shows. */
export function byRecent(a: TradePlan, b: TradePlan): number {
  return b.createdAt.localeCompare(a.createdAt);
}

/** Losses in a row that count as a losing streak. */
export const LOSS_STREAK_LIMIT = 3;

/** Risk per trade while the streak guard is holding it down, in percent. */
export const STREAK_RISK_PERCENT = 1;

export type EffectiveRisk = {
  /** The percent sizing uses right now. */
  percent: number;
  /** True while the streak guard has lowered it below the setting. */
  lowered: boolean;
  lossStreak: number;
};

/**
 * The risk per trade that applies now: the user's setting, or the streak
 * guard's lower figure while the last `LOSS_STREAK_LIMIT` or more closed
 * trades were all losses. One win ends the streak and restores the setting.
 */
export function effectiveRisk(
  plans: readonly TradePlan[],
  riskPercent: number,
  streakGuard: boolean,
): EffectiveRisk {
  const lossStreak = performance(plans)?.lossStreak ?? 0;
  const lowered =
    streakGuard &&
    lossStreak >= LOSS_STREAK_LIMIT &&
    riskPercent > STREAK_RISK_PERCENT;

  return {
    percent: lowered ? STREAK_RISK_PERCENT : riskPercent,
    lowered,
    lossStreak,
  };
}

/**
 * The open position on the same stock that a new plan would be averaging
 * down into: one bought at a higher price than the new entry. Returns the
 * highest-priced such position, or `null`.
 */
export function averagingDownOn(
  plans: readonly TradePlan[],
  code: string,
  entry: number,
  excludeId?: string,
): TradePlan | null {
  const candidates = plans.filter(
    (plan) =>
      plan.status === "open" &&
      plan.code === code &&
      plan.id !== excludeId &&
      entry > 0 &&
      entry < plan.entry,
  );

  return candidates.sort((a, b) => b.entry - a.entry)[0] ?? null;
}
