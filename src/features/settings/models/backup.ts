import { z } from "zod";

import type { TradePlan } from "@/features/trade-log/models/plan";
import { tradeLogTable, type Cell } from "@/features/trade-log/models/table";

/** Bumped when the file's shape changes; older files are migrated on read. */
export const BACKUP_VERSION = 1;

const planSchema = z.object({
  id: z.string().min(1),
  code: z.string().regex(/^[A-Z]{4}$/),
  name: z.string(),
  entry: z.number().positive(),
  stopLoss: z.number().positive(),
  target: z.number().positive().nullable(),
  lots: z.number().int().nonnegative(),
  status: z.enum(["planned", "open", "closed"]),
  createdAt: z.string(),
  openedAt: z.string().nullable(),
  closedAt: z.string().nullable(),
  exitPrice: z.number().positive().nullable(),
  note: z.string().default(""),
});

/**
 * Everything a restore needs, and nothing it does not: the theme and
 * language stay with the device they were chosen on.
 *
 * A file is untrusted input — it may be hand-edited, truncated, or another
 * app's JSON — so it is validated in full before anything is replaced.
 */
export const backupSchema = z.object({
  app: z.literal("trade-plan"),
  version: z.number().int().min(1).max(BACKUP_VERSION),
  exportedAt: z.string(),
  profile: z.object({
    name: z.string().min(1),
    balance: z.number().positive(),
    riskPercent: z.number(),
    streakGuard: z.boolean(),
  }),
  plans: z.array(planSchema),
});

export type Backup = z.infer<typeof backupSchema>;

export function buildBackup(
  profile: Backup["profile"],
  plans: TradePlan[],
  now = new Date(),
): Backup {
  return {
    app: "trade-plan",
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    profile,
    plans,
  };
}

/** Reads a backup file's text, or returns `null` if it is not one. */
export function parseBackup(text: string): Backup | null {
  try {
    const result = backupSchema.safeParse(JSON.parse(text));

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function csvCell(value: Cell): string {
  if (value === null) return "";

  const text = String(value);

  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * The trade log as CSV for a spreadsheet. Numbers are written plain (no
 * grouping, `.` decimals) so any locale's spreadsheet reads them as numbers.
 */
export function toCsv(plans: readonly TradePlan[]): string {
  return tradeLogTable(plans)
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}
