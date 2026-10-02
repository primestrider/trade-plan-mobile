import { NOTE_MAX_LENGTH } from "@/features/trade-log/models/form.schema";
import {
  sizePosition,
  type PlanStatus,
  type TradePlan,
} from "@/features/trade-log/models/plan";
import {
  TRADE_LOG_COLUMNS,
  type Cell,
  type TradeLogColumn,
} from "@/features/trade-log/models/table";
import { isOnTick } from "@/features/trade-log/models/tick";

/** A cell that held something, but not a number. */
const INVALID = Symbol("invalid");
type Price = number | null | typeof INVALID;

/**
 * The fields a user may change from the sheet. Everything else in a row is
 * the app's to write: the name and dates are records, lots are sized by the
 * risk limit, and profit and R are worked out from the prices.
 */
export type SyncedFields = {
  entry: Price;
  stopLoss: Price;
  target: Price;
  status: string;
  exitPrice: Price;
  note: string;
};

/** The synced fields of every plan as they were last written to the sheet. */
export type Snapshot = Record<string, SyncedFields>;

const FIELDS = [
  "entry",
  "stopLoss",
  "target",
  "status",
  "exitPrice",
  "note",
] as const satisfies readonly (keyof SyncedFields)[];

const STATUSES: readonly string[] = ["planned", "open", "closed"] satisfies PlanStatus[];

export type RejectReason =
  | "codeInvalid"
  | "priceMissing"
  | "priceInvalid"
  | "tickInvalid"
  | "stopLossAboveEntry"
  | "targetBelowEntry"
  | "statusInvalid"
  | "exitRequired"
  | "tooWide";

/** A sheet row whose edit was not taken, and why. `row` is the sheet's row number. */
export type Rejection = { row: number; code: string; reason: RejectReason };

export type PlanPatch = { id: string; changes: Partial<TradePlan> };

export type MergeInput = {
  /** The log tab as read, header first. */
  values: Cell[][];
  plans: readonly TradePlan[];
  snapshot: Snapshot;
  balance: number;
  /** The risk that sizes new or re-priced plans (streak guard applied). */
  riskPercent: number;
  /** Company names by code, when the stock list is at hand. */
  names: ReadonlyMap<string, string>;
  now: string;
  newId: () => string;
};

export type MergeResult = {
  patches: PlanPatch[];
  additions: TradePlan[];
  rejections: Rejection[];
};

export function syncedFields(plan: TradePlan): SyncedFields {
  return {
    entry: plan.entry,
    stopLoss: plan.stopLoss,
    target: plan.target,
    status: plan.status,
    exitPrice: plan.exitPrice,
    note: plan.note,
  };
}

export function snapshotOf(plans: readonly TradePlan[]): Snapshot {
  return Object.fromEntries(plans.map((plan) => [plan.id, syncedFields(plan)]));
}

function price(cell: Cell | undefined): Price {
  if (cell === null || cell === undefined || cell === "") return null;
  if (typeof cell === "number") return cell;

  const trimmed = cell.trim();
  if (trimmed === "") return null;

  const value = Number(trimmed);
  return Number.isFinite(value) ? value : INVALID;
}

const text = (cell: Cell | undefined) =>
  cell === null || cell === undefined ? "" : String(cell).trim();

/** Where each known column sits in the sheet, or `null` without an `id` column. */
function columnsOf(header: Cell[] | undefined) {
  const columns = new Map<TradeLogColumn, number>();

  header?.forEach((cell, index) => {
    const name = text(cell) as TradeLogColumn;
    if (TRADE_LOG_COLUMNS.includes(name) && !columns.has(name)) {
      columns.set(name, index);
    }
  });

  return columns.has("id") ? columns : null;
}

type SheetRow = SyncedFields & { id: string; code: string; name: string };

function readRow(row: Cell[], columns: Map<TradeLogColumn, number>): SheetRow {
  const at = (column: TradeLogColumn) => {
    const index = columns.get(column);
    return index === undefined ? undefined : row[index];
  };

  return {
    id: text(at("id")),
    code: text(at("code")).toUpperCase(),
    name: text(at("name")),
    entry: price(at("entry")),
    stopLoss: price(at("stop_loss")),
    target: price(at("target")),
    status: text(at("status")).toLowerCase(),
    exitPrice: price(at("exit")),
    note: text(at("note")).slice(0, NOTE_MAX_LENGTH),
  };
}

const isBlank = (row: Cell[]) => row.every((cell) => text(cell) === "");

/** Checks one price the way the plan form does. */
function priceProblem(value: Price, required: boolean): RejectReason | null {
  if (value === null) return required ? "priceMissing" : null;
  if (value === INVALID || !Number.isInteger(value) || value <= 0) {
    return "priceInvalid";
  }
  return isOnTick(value) ? null : "tickInvalid";
}

/** The same rules the plan form and close sheet apply, for a merged row. */
function problemWith(fields: SyncedFields): RejectReason | null {
  const { entry, stopLoss, target, status, exitPrice } = fields;

  if (!STATUSES.includes(status)) return "statusInvalid";

  const entryProblem = priceProblem(entry, true);
  if (entryProblem) return entryProblem;
  const stopProblem = priceProblem(stopLoss, true);
  if (stopProblem) return stopProblem;
  const targetProblem = priceProblem(target, false);
  if (targetProblem) return targetProblem;

  if ((stopLoss as number) >= (entry as number)) return "stopLossAboveEntry";
  if (target !== null && (target as number) <= (entry as number)) {
    return "targetBelowEntry";
  }

  if (status === "closed") {
    if (exitPrice === null) return "exitRequired";
    const exitProblem = priceProblem(exitPrice, true);
    if (exitProblem) return exitProblem;
  }

  return null;
}

/** The dates and exit that go with a status the sheet set. */
function statusChanges(
  plan: Pick<TradePlan, "openedAt">,
  status: PlanStatus,
  now: string,
): Partial<TradePlan> {
  if (status === "planned") {
    return { status, openedAt: null, closedAt: null, exitPrice: null };
  }
  if (status === "open") {
    return { status, openedAt: plan.openedAt ?? now, closedAt: null, exitPrice: null };
  }
  return { status, openedAt: plan.openedAt ?? now, closedAt: now };
}

/**
 * Works out what the sheet changed since the last sync, and how much of it
 * the app takes.
 *
 * A three-way comparison: for each synced field, the sheet's value and the
 * app's are compared with what was last written (`snapshot`). A field the
 * sheet changed and the app did not is taken from the sheet; a field both
 * changed keeps the app's value (the app wins); fields changed on different
 * sides are combined. The merged row must pass the same rules as the plan
 * form, or none of its changes are taken.
 *
 * A row without a known id is a new plan, sized by the risk limit. A row
 * removed from the sheet does nothing — deleting is done in the app — and
 * a row for a plan deleted in the app is dropped on the next write.
 */
export function mergeSheet(input: MergeInput): MergeResult | null {
  const { values, plans, snapshot, balance, riskPercent, names, now, newId } =
    input;
  const columns = columnsOf(values[0]);

  // Without an id column the rows cannot be matched to plans (a sheet from
  // before two-way sync, or a mangled header): the write replaces it.
  if (!columns) return null;

  const byId = new Map(plans.map((plan) => [plan.id, plan]));
  const seen = new Set<string>();
  const result: MergeResult = { patches: [], additions: [], rejections: [] };

  values.slice(1).forEach((cells, index) => {
    if (isBlank(cells)) return;

    const rowNumber = index + 2;
    const row = readRow(cells, columns);
    const plan = byId.get(row.id);

    // Deleted in the app since the last sync: the app wins, the row goes.
    if (!plan && row.id && snapshot[row.id]) return;

    // A copied row repeats an id; only the first one is the plan itself.
    if (plan && !seen.has(plan.id)) {
      seen.add(plan.id);
      const base = snapshot[plan.id];
      if (!base) return;

      const patch = mergeExisting(plan, row, base, balance, riskPercent, now);
      if (patch === null) return;
      if ("reason" in patch) {
        result.rejections.push({ row: rowNumber, code: plan.code, reason: patch.reason });
      } else {
        result.patches.push(patch);
      }
      return;
    }

    const added = newPlan(row, balance, riskPercent, names, now, newId);
    if ("reason" in added) {
      result.rejections.push({ row: rowNumber, code: row.code, reason: added.reason });
    } else {
      result.additions.push(added);
    }
  });

  return result;
}

const same = (a: SyncedFields[keyof SyncedFields], b: SyncedFields[keyof SyncedFields]) =>
  a === b;

function mergeExisting(
  plan: TradePlan,
  row: SheetRow,
  base: SyncedFields,
  balance: number,
  riskPercent: number,
  now: string,
): PlanPatch | { reason: RejectReason } | null {
  const app = syncedFields(plan);
  const merged: SyncedFields = { ...app };
  let changed = false;

  for (const field of FIELDS) {
    const sheetChanged = !same(row[field], base[field]);
    const appChanged = !same(app[field], base[field]);

    if (sheetChanged && !appChanged) {
      (merged as Record<string, unknown>)[field] = row[field];
      changed = true;
    }
  }

  if (!changed) return null;

  // A status other than closed carries no exit; clear it before checking.
  if (merged.status !== "closed") merged.exitPrice = null;

  const reason = problemWith(merged);
  if (reason) return { reason };

  const entry = merged.entry as number;
  const stopLoss = merged.stopLoss as number;
  const changes: Partial<TradePlan> = {
    entry,
    stopLoss,
    target: merged.target as number | null,
    note: merged.note,
    exitPrice: merged.exitPrice as number | null,
  };

  if (merged.status !== plan.status) {
    Object.assign(changes, statusChanges(plan, merged.status as PlanStatus, now));
    changes.exitPrice = merged.exitPrice as number | null;
  }

  // A plan not yet bought is re-sized to its new prices, as the form does;
  // a bought position keeps the lots that were actually bought.
  const repriced = entry !== plan.entry || stopLoss !== plan.stopLoss;
  if (merged.status === "planned" && repriced) {
    const size = sizePosition({ entry, stopLoss }, balance, riskPercent);
    if (!size || size.lots === 0) return { reason: "tooWide" };
    changes.lots = size.lots;
  }

  return { id: plan.id, changes };
}

function newPlan(
  row: SheetRow,
  balance: number,
  riskPercent: number,
  names: ReadonlyMap<string, string>,
  now: string,
  newId: () => string,
): TradePlan | { reason: RejectReason } {
  if (!/^[A-Z]{4}$/.test(row.code)) return { reason: "codeInvalid" };

  const fields: SyncedFields = { ...row, status: row.status || "planned" };
  if (fields.status !== "closed") fields.exitPrice = null;

  const reason = problemWith(fields);
  if (reason) return { reason };

  const entry = fields.entry as number;
  const stopLoss = fields.stopLoss as number;
  const size = sizePosition({ entry, stopLoss }, balance, riskPercent);
  if (!size || size.lots === 0) return { reason: "tooWide" };

  const status = fields.status as PlanStatus;
  const dates = statusChanges({ openedAt: null }, status, now);

  return {
    id: newId(),
    code: row.code,
    name: names.get(row.code) ?? row.name,
    entry,
    stopLoss,
    target: fields.target as number | null,
    lots: size.lots,
    note: fields.note,
    status,
    createdAt: now,
    openedAt: dates.openedAt ?? null,
    closedAt: dates.closedAt ?? null,
    exitPrice: status === "closed" ? (fields.exitPrice as number) : null,
  };
}
