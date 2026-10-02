import {
  mergeSheet,
  snapshotOf,
  type MergeInput,
} from "@/features/google-sheets/models/merge";
import type { TradePlan } from "@/features/trade-log/models/plan";
import { tradeLogTable, type Cell } from "@/features/trade-log/models/table";

const NOW = "2026-10-03T03:00:00.000Z";

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

/** The sheet as the app last wrote it, then edited cell by cell. */
function sheetOf(plans: readonly TradePlan[], edit: (rows: Cell[][]) => void = () => {}) {
  const values = tradeLogTable(plans);
  edit(values);
  return values;
}

const col = (name: string) => tradeLogTable([])[0].indexOf(name);

function merge(overrides: Partial<MergeInput>) {
  const plans = overrides.plans ?? [plan()];

  return mergeSheet({
    values: sheetOf(plans),
    plans,
    snapshot: snapshotOf(plans),
    balance: 10_000_000,
    riskPercent: 2,
    names: new Map([["TLKM", "Telkom Indonesia (Persero) Tbk."]]),
    now: NOW,
    newId: () => "new-1",
    ...overrides,
  });
}

it("changes nothing when neither side did", () => {
  expect(merge({})).toEqual({ patches: [], additions: [], rejections: [] });
});

it("takes a field changed in the sheet, and re-sizes a plan not yet bought", () => {
  const plans = [plan()];
  const values = sheetOf(plans, (rows) => {
    rows[1][col("stop_loss")] = 8800; // 200 per share → 10 lots at 2%
    rows[1][col("note")] = "Breakout";
  });

  expect(merge({ plans, values })?.patches).toEqual([
    {
      id: "p1",
      changes: expect.objectContaining({ stopLoss: 8800, note: "Breakout", lots: 10 }),
    },
  ]);
});

it("keeps the app's value when both sides changed the same field", () => {
  const before = [plan()];
  const values = sheetOf(before, (rows) => {
    rows[1][col("target")] = 10000;
  });
  const now = [plan({ target: 9800 })];

  const result = merge({ plans: now, values, snapshot: snapshotOf(before) });

  expect(result?.patches).toEqual([]);
});

it("combines changes made to different fields on each side", () => {
  const before = [plan()];
  const values = sheetOf(before, (rows) => {
    rows[1][col("note")] = "From the sheet";
  });
  const now = [plan({ target: 9800 })];

  const [patch] = merge({ plans: now, values, snapshot: snapshotOf(before) })!.patches;

  expect(patch.changes).toMatchObject({ target: 9800, note: "From the sheet" });
});

it("records the sale when the sheet closes a position", () => {
  const plans = [plan({ status: "open", openedAt: "2026-10-02T02:00:00.000Z" })];
  const values = sheetOf(plans, (rows) => {
    rows[1][col("status")] = "closed";
    rows[1][col("exit")] = 9600;
  });

  const [patch] = merge({ plans, values })!.patches;

  expect(patch.changes).toMatchObject({
    status: "closed",
    exitPrice: 9600,
    closedAt: NOW,
    openedAt: "2026-10-02T02:00:00.000Z",
  });
  expect(patch.changes).not.toHaveProperty("lots");
});

it.each([
  ["a price off the IDX steps", "entry", 9010, "tickInvalid"],
  ["a stop above the entry", "stop_loss", 9100, "stopLossAboveEntry"],
  ["a status the app does not know", "status", "sold", "statusInvalid"],
  ["text where a price goes", "target", "sepuluh ribu", "priceInvalid"],
  ["a stop too wide for the limit", "stop_loss", 4000, "tooWide"],
])("refuses %s and keeps the plan as it was", (_, column, value, reason) => {
  const plans = [plan()];
  const values = sheetOf(plans, (rows) => {
    rows[1][col(column)] = value;
  });

  expect(merge({ plans, values })).toEqual({
    patches: [],
    additions: [],
    rejections: [{ row: 2, code: "BBCA", reason }],
  });
});

it("refuses closing without an exit price", () => {
  const plans = [plan({ status: "open" })];
  const values = sheetOf(plans, (rows) => {
    rows[1][col("status")] = "closed";
  });

  expect(merge({ plans, values })?.rejections).toEqual([
    { row: 2, code: "BBCA", reason: "exitRequired" },
  ]);
});

describe("rows added in the sheet", () => {
  const addRow = (cells: Record<string, Cell>) => (rows: Cell[][]) => {
    const row: Cell[] = rows[0].map(() => "");
    for (const [name, value] of Object.entries(cells)) row[col(name)] = value;
    rows.push(row);
  };

  it("become plans, named from the stock list and sized by the risk limit", () => {
    const plans = [plan()];
    const values = sheetOf(
      plans,
      addRow({ code: "tlkm", entry: 3000, stop_loss: 2900, note: "Rebound" }),
    );

    expect(merge({ plans, values })?.additions).toEqual([
      {
        id: "new-1",
        code: "TLKM",
        name: "Telkom Indonesia (Persero) Tbk.",
        entry: 3000,
        stopLoss: 2900,
        target: null,
        lots: 20,
        note: "Rebound",
        status: "planned",
        createdAt: NOW,
        openedAt: null,
        closedAt: null,
        exitPrice: null,
      },
    ]);
  });

  it("are refused without a valid code or prices", () => {
    const plans = [plan()];
    const values = sheetOf(plans, (rows) => {
      addRow({ code: "TELKOM", entry: 3000, stop_loss: 2900 })(rows);
      addRow({ code: "ASII", entry: 5000 })(rows);
    });

    expect(merge({ plans, values })?.rejections).toEqual([
      { row: 3, code: "TELKOM", reason: "codeInvalid" },
      { row: 4, code: "ASII", reason: "priceMissing" },
    ]);
  });

  it("include a copied row, which repeats an existing id", () => {
    const plans = [plan()];
    const values = sheetOf(plans, (rows) => rows.push([...rows[1]]));

    expect(merge({ plans, values })?.additions).toHaveLength(1);
  });

  it("are ignored when blank", () => {
    const plans = [plan()];
    const values = sheetOf(plans, (rows) => rows.push(["", "", null]));

    expect(merge({ plans, values })).toEqual({
      patches: [],
      additions: [],
      rejections: [],
    });
  });
});

it("ignores a row for a plan deleted in the app", () => {
  const before = [plan()];
  const values = sheetOf(before);

  expect(merge({ plans: [], values, snapshot: snapshotOf(before) })).toEqual({
    patches: [],
    additions: [],
    rejections: [],
  });
});

it("does not delete a plan whose row was removed from the sheet", () => {
  const plans = [plan()];
  const values = sheetOf(plans, (rows) => rows.splice(1, 1));

  expect(merge({ plans, values })?.patches).toEqual([]);
});

it("reads rows by header name, so reordered columns still match", () => {
  const plans = [plan()];
  const values = sheetOf(plans, (rows) => {
    rows[1][col("note")] = "Moved";
    for (const row of rows) row.reverse();
  });

  expect(merge({ plans, values })?.patches[0].changes).toMatchObject({
    note: "Moved",
  });
});

it("gives no answer for a sheet without an id column", () => {
  const values = [["code", "entry"], ["BBCA", 9000]];

  expect(merge({ values })).toBeNull();
});
