import type { TradePlan } from "@/features/trade-log/models/plan";
import { tradeStats } from "@/features/trade-log/models/stats";

/** Entry 1.000, stop 900 (1R = 100/share), 1 lot. */
const closed = (id: string, exitPrice: number, day: number): TradePlan => ({
  id,
  code: "BBCA",
  name: "",
  entry: 1000,
  stopLoss: 900,
  target: null,
  lots: 1,
  status: "closed",
  createdAt: `2026-09-0${day}T00:00:00.000Z`,
  openedAt: null,
  closedAt: `2026-09-0${day}T08:00:00.000Z`,
  exitPrice,
  note: "",
});

it("follows the running total and its deepest fall", () => {
  const stats = tradeStats([
    closed("a", 1200, 1), // +20.000, +2R
    closed("b", 900, 2), // -10.000, -1R
    closed("c", 900, 3), // -10.000, -1R
    closed("d", 1300, 4), // +30.000, +3R
  ]);

  expect(stats).toMatchObject({
    trades: 4,
    wins: 2,
    totalProfit: 30_000,
    winRate: 0.5,
    expectancyR: 0.75,
    profitFactor: 2.5,
    averageWinR: 2.5,
    averageLossR: -1,
    bestR: 3,
    worstR: -1,
    maxDrawdown: 20_000,
    curve: [0, 20_000, 10_000, 0, 30_000],
  });
});

it("has no profit factor before the first loss", () => {
  expect(tradeStats([closed("a", 1100, 1)])?.profitFactor).toBeNull();
});

it("has nothing to show before a trade is closed", () => {
  expect(tradeStats([])).toBeNull();
});
