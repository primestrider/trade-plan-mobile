import {
  averagingDownOn,
  effectiveRisk,
  openRisk,
  performance,
  rewardRatio,
  rMultiple,
  sizePosition,
  type TradePlan,
} from "@/features/trade-log/models/plan";

const plan = (overrides: Partial<TradePlan> = {}): TradePlan => ({
  id: "p1",
  code: "BBCA",
  name: "Bank Central Asia Tbk.",
  entry: 9000,
  stopLoss: 8700,
  target: 9900,
  lots: 6,
  status: "planned",
  createdAt: "2026-10-01T02:00:00.000Z",
  openedAt: null,
  closedAt: null,
  exitPrice: null,
  note: "",
  ...overrides,
});

describe("sizing a position", () => {
  it("fits as many lots as the per-trade loss limit allows", () => {
    // 2% of 10 jt = 200.000; 300 per share × 100 = 30.000 per lot → 6 lots.
    const size = sizePosition({ entry: 9000, stopLoss: 8700 }, 10_000_000, 2);

    expect(size).toMatchObject({
      lots: 6,
      risk: 180_000,
      cost: 5_400_000,
      maxLoss: 200_000,
      limitedByCapital: false,
    });
  });

  it("never buys more than the capital can pay for", () => {
    // A tight stop would allow 200 lots by risk; 10 jt only buys 11.
    const size = sizePosition({ entry: 9000, stopLoss: 8990 }, 10_000_000, 2);

    expect(size).toMatchObject({ lots: 11, limitedByCapital: true });
  });

  it("comes to zero lots when the stop is wider than the limit", () => {
    expect(
      sizePosition({ entry: 9000, stopLoss: 4000 }, 1_000_000, 2)?.lots,
    ).toBe(0);
  });

  it("has no answer until the stop loss sits below the entry", () => {
    expect(sizePosition({ entry: 9000, stopLoss: 9000 }, 10_000_000, 2)).toBeNull();
    expect(sizePosition({ entry: 0, stopLoss: 0 }, 10_000_000, 2)).toBeNull();
  });
});

describe("results", () => {
  it("measures reward and outcome in units of risk", () => {
    expect(rewardRatio(plan())).toBe(3);
    expect(rMultiple(plan({ status: "closed", exitPrice: 8700 }))).toBe(-1);
    expect(rMultiple(plan({ status: "closed", exitPrice: 9600 }))).toBe(2);
  });

  it("adds up the risk of open positions only", () => {
    const plans = [
      plan({ id: "a", status: "open" }),
      plan({ id: "b", status: "open", lots: 2 }),
      plan({ id: "c" }),
    ];

    expect(openRisk(plans)).toEqual({ positions: 2, amount: 240_000 });
  });

  it("summarizes closed trades, counting the current losing run", () => {
    const closed = (id: string, exitPrice: number, closedAt: string) =>
      plan({ id, status: "closed", exitPrice, closedAt });

    const result = performance([
      closed("a", 9600, "2026-09-01T00:00:00.000Z"),
      closed("b", 8700, "2026-09-03T00:00:00.000Z"),
      closed("c", 8700, "2026-09-02T00:00:00.000Z"),
      plan({ id: "d", status: "open" }),
    ]);

    expect(result).toMatchObject({
      trades: 3,
      wins: 1,
      lossStreak: 2,
    });
    expect(result?.winRate).toBeCloseTo(1 / 3);
    expect(result?.averageR).toBe(0);
  });

  it("has nothing to summarize before a trade is closed", () => {
    expect(performance([plan()])).toBeNull();
  });
});

describe("the streak guard", () => {
  const loss = (id: string, day: number) =>
    plan({
      id,
      status: "closed",
      exitPrice: 8700,
      closedAt: `2026-09-0${day}T00:00:00.000Z`,
    });

  const threeLosses = [loss("a", 1), loss("b", 2), loss("c", 3)];

  it("lowers risk to 1% after three losses in a row", () => {
    expect(effectiveRisk(threeLosses, 2, true)).toEqual({
      percent: 1,
      lowered: true,
      lossStreak: 3,
    });
  });

  it("leaves the setting alone when turned off, or already at 1% or less", () => {
    expect(effectiveRisk(threeLosses, 2, false).percent).toBe(2);
    expect(effectiveRisk(threeLosses, 0.5, true)).toMatchObject({
      percent: 0.5,
      lowered: false,
    });
  });

  it("restores the setting after a win", () => {
    const win = plan({
      id: "d",
      status: "closed",
      exitPrice: 9600,
      closedAt: "2026-09-04T00:00:00.000Z",
    });

    expect(effectiveRisk([...threeLosses, win], 2, true).lowered).toBe(false);
  });
});

describe("averaging down", () => {
  const held = plan({ id: "held", status: "open", entry: 9000 });

  it("flags a new entry below an open position on the same stock", () => {
    expect(averagingDownOn([held], "BBCA", 8500)).toBe(held);
  });

  it("ignores higher entries, other stocks, unbought plans and the plan itself", () => {
    expect(averagingDownOn([held], "BBCA", 9200)).toBeNull();
    expect(averagingDownOn([held], "TLKM", 8500)).toBeNull();
    expect(averagingDownOn([plan({ entry: 9000 })], "BBCA", 8500)).toBeNull();
    expect(averagingDownOn([held], "BBCA", 8500, "held")).toBeNull();
  });
});
