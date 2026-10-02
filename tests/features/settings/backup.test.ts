import {
  buildBackup,
  parseBackup,
  toCsv,
} from "@/features/settings/models/backup";
import type { TradePlan } from "@/features/trade-log/models/plan";

const plan: TradePlan = {
  id: "p1",
  code: "BBCA",
  name: "Bank Central Asia Tbk.",
  entry: 9000,
  stopLoss: 8700,
  target: 9900,
  lots: 6,
  status: "closed",
  createdAt: "2026-09-01T02:00:00.000Z",
  openedAt: "2026-09-01T03:00:00.000Z",
  closedAt: "2026-09-05T08:00:00.000Z",
  exitPrice: 9600,
  note: 'Breakout, "volume" tinggi\nbatal jika < 8.700',
};

const profile = {
  name: "Ricky",
  balance: 10_000_000,
  riskPercent: 2,
  streakGuard: true,
};

describe("a backup file", () => {
  it("reads back exactly what was written", () => {
    const backup = buildBackup(profile, [plan], new Date("2026-10-02T00:00:00Z"));

    expect(parseBackup(JSON.stringify(backup))).toEqual(backup);
  });

  it("fills in a note for plans saved before notes existed", () => {
    const { note: _note, ...withoutNote } = plan;
    const backup = { ...buildBackup(profile, []), plans: [withoutNote] };

    expect(parseBackup(JSON.stringify(backup))?.plans[0].note).toBe("");
  });

  it.each([
    ["not JSON", "hello"],
    ["another app's JSON", JSON.stringify({ name: "x" })],
    [
      "a broken plan",
      JSON.stringify({ ...buildBackup(profile, []), plans: [{ ...plan, entry: -1 }] }),
    ],
    [
      "a file from a newer app",
      JSON.stringify({ ...buildBackup(profile, []), version: 99 }),
    ],
  ])("is refused when it is %s", (_, text) => {
    expect(parseBackup(text)).toBeNull();
  });
});

describe("the CSV export", () => {
  it("writes one plain-number row per plan, quoting text that needs it", () => {
    const [header, row] = toCsv([plan]).split("\r\n");

    expect(header).toBe(
      "id,code,name,status,entry,stop_loss,target,lots,exit,profit_rp,r_multiple,created_at,opened_at,closed_at,note",
    );
    expect(row).toBe(
      'p1,BBCA,Bank Central Asia Tbk.,closed,9000,8700,9900,6,9600,360000,2,' +
        "2026-09-01T02:00:00.000Z,2026-09-01T03:00:00.000Z,2026-09-05T08:00:00.000Z," +
        '"Breakout, ""volume"" tinggi\nbatal jika < 8.700"',
    );
  });
});
