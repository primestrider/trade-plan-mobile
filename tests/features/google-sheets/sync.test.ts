import { act } from "@testing-library/react-native";
import { GoogleOneTapSignIn, statusCodes } from "react-native-nitro-google-signin";

import {
  addLogTab,
  createSpreadsheet,
  formatLogTab,
  readLog,
  SheetsError,
  writeLog,
} from "@/features/google-sheets/services/sheets";
import { snapshotOf } from "@/features/google-sheets/models/merge";
import type { TradePlan } from "@/features/trade-log/models/plan";
import { tradeLogTable } from "@/features/trade-log/models/table";
import { useProfileStore } from "@/shared/stores";
import {
  connectGoogle,
  disconnectGoogle,
  syncNow,
} from "@/features/google-sheets/services/sync";
import { useSheetStore } from "@/features/google-sheets/stores/sheet.store";
import { usePlanStore } from "@/features/trade-log/stores/plan.store";

jest.mock("@/plugins/google", () => ({
  DRIVE_FILE_SCOPE: "https://www.googleapis.com/auth/drive.file",
  isGoogleConfigured: true,
  ensureGoogleConfigured: jest.fn(),
}));

jest.mock("@/features/google-sheets/services/sheets", () => {
  const actual = jest.requireActual("@/features/google-sheets/services/sheets");
  return {
    ...actual,
    createSpreadsheet: jest.fn(),
    addLogTab: jest.fn(),
    writeLog: jest.fn(),
    readLog: jest.fn(),
    formatLogTab: jest.fn(),
  };
});

const DRIVE = "https://www.googleapis.com/auth/drive.file";
const google = jest.mocked(GoogleOneTapSignIn);
const account = { id: "g1", email: "ricky@example.com", name: "Ricky", photo: null };
const sheet = { spreadsheetId: "s1", spreadsheetUrl: "https://docs.google.com/s1" };

const success = (scopes: string[]) => ({
  type: "success" as const,
  data: {
    user: { ...account, givenName: null, familyName: null },
    scopes,
    idToken: "id",
    serverAuthCode: null,
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  google.getTokens.mockResolvedValue({ idToken: "id", accessToken: "tok" });
  jest.mocked(createSpreadsheet).mockResolvedValue(sheet);
  jest.mocked(writeLog).mockResolvedValue(undefined);
  jest.mocked(readLog).mockResolvedValue([]);
  jest.mocked(formatLogTab).mockResolvedValue(undefined);
  act(() => {
    useSheetStore.setState({
      account: null,
      spreadsheets: {},
      snapshots: {},
      rejections: [],
      lastSyncedAt: null,
      syncing: false,
      error: null,
    });
    usePlanStore.setState({ plans: [] });
    useProfileStore.setState({ balance: 10_000_000, riskPercent: 2, streakGuard: true });
  });
});

describe("connecting", () => {
  it("asks for Drive access when the account has not granted it yet", async () => {
    google.signIn.mockResolvedValue({ type: "noSavedCredentialFound", data: null });
    google.createAccount.mockResolvedValue(success([]));
    google.requestScopes.mockResolvedValue({ accessToken: "tok", serverAuthCode: null });

    await expect(connectGoogle()).resolves.toBe("connected");

    expect(google.requestScopes).toHaveBeenCalledWith([DRIVE]);
    expect(useSheetStore.getState().account).toEqual(account);
  });

  it("treats declining Drive access as cancelling, and signs back out", async () => {
    google.signIn.mockResolvedValue(success([]));
    google.requestScopes.mockRejectedValue(
      Object.assign(new Error("cancel"), { code: statusCodes.SIGN_IN_CANCELLED }),
    );

    await expect(connectGoogle()).resolves.toBe("cancelled");

    expect(google.signOut).toHaveBeenCalled();
    expect(useSheetStore.getState().account).toBeNull();
  });

  it("revokes access on disconnect but keeps the spreadsheet on record", async () => {
    act(() =>
      useSheetStore.setState({ account, spreadsheets: { g1: sheet } }),
    );

    await disconnectGoogle();

    expect(google.revokeAccess).toHaveBeenCalledWith("g1");
    expect(useSheetStore.getState()).toMatchObject({
      account: null,
      spreadsheets: { g1: sheet },
    });
  });
});

describe("syncing", () => {
  beforeEach(() => {
    act(() => useSheetStore.setState({ account }));
  });

  it("makes the spreadsheet on first sync, then writes the log to it", async () => {
    await syncNow();

    expect(createSpreadsheet).toHaveBeenCalledWith("tok");
    expect(writeLog).toHaveBeenCalledWith(
      "tok",
      "s1",
      [expect.arrayContaining(["code", "note"])],
    );
    expect(useSheetStore.getState()).toMatchObject({
      spreadsheets: { g1: sheet },
      error: null,
      syncing: false,
    });
    expect(useSheetStore.getState().lastSyncedAt).not.toBeNull();
  });

  it("makes a new spreadsheet when the old one was deleted", async () => {
    act(() =>
      useSheetStore.setState({
        spreadsheets: { g1: { spreadsheetId: "gone", spreadsheetUrl: "x" } },
      }),
    );
    jest
      .mocked(readLog)
      .mockRejectedValueOnce(new SheetsError("notFound", "deleted"));

    await syncNow();

    expect(createSpreadsheet).toHaveBeenCalled();
    expect(jest.mocked(writeLog).mock.calls[0][1]).toBe("s1");
    expect(useSheetStore.getState().error).toBeNull();
  });

  it("adds the log tab back when it was renamed or deleted", async () => {
    act(() => useSheetStore.setState({ spreadsheets: { g1: sheet } }));
    jest
      .mocked(readLog)
      .mockRejectedValueOnce(new SheetsError("missingTab", "parse range"));

    await syncNow();

    expect(addLogTab).toHaveBeenCalledWith("tok", "s1");
    expect(writeLog).toHaveBeenCalledTimes(1);
    expect(formatLogTab).toHaveBeenCalled();
  });

  it("refreshes an expired token once", async () => {
    act(() => useSheetStore.setState({ spreadsheets: { g1: sheet } }));
    google.getTokens
      .mockResolvedValueOnce({ idToken: "id", accessToken: "old" })
      .mockResolvedValueOnce({ idToken: "id", accessToken: "new" });
    jest
      .mocked(writeLog)
      .mockRejectedValueOnce(new SheetsError("unauthorized", "expired"));

    await syncNow();

    expect(google.clearCachedAccessToken).toHaveBeenCalledWith("old");
    expect(jest.mocked(writeLog).mock.calls[1][0]).toBe("new");
  });

  it("records an offline failure instead of throwing", async () => {
    jest.mocked(writeLog).mockRejectedValue(new SheetsError("offline", "no network"));

    await expect(syncNow()).resolves.toBeUndefined();

    expect(useSheetStore.getState()).toMatchObject({
      error: "offline",
      syncing: false,
    });
  });

  it("asks to reconnect when Google no longer has a session", async () => {
    google.getTokens.mockRejectedValue(
      Object.assign(new Error("x"), { code: statusCodes.SIGN_IN_REQUIRED }),
    );

    await syncNow();

    expect(useSheetStore.getState().error).toBe("reconnect");
  });

  it("folds calls made mid-sync into one more pass", async () => {
    act(() => useSheetStore.setState({ spreadsheets: { g1: sheet } }));

    await Promise.all([syncNow(), syncNow(), syncNow()]);

    expect(writeLog).toHaveBeenCalledTimes(2);
  });

  it("does nothing while no account is connected", async () => {
    act(() => useSheetStore.setState({ account: null }));

    await syncNow();

    expect(writeLog).not.toHaveBeenCalled();
  });
});

describe("syncing both ways", () => {
  const bbca: TradePlan = {
    id: "p1",
    code: "BBCA",
    name: "",
    entry: 9000,
    stopLoss: 8700,
    target: null,
    lots: 6,
    status: "planned",
    createdAt: "2026-10-01T02:00:00.000Z",
    openedAt: null,
    closedAt: null,
    exitPrice: null,
    note: "",
  };

  beforeEach(() => {
    act(() => {
      useSheetStore.setState({ account, spreadsheets: { g1: sheet } });
      usePlanStore.setState({ plans: [bbca] });
    });
  });

  it("only writes a sheet it has no snapshot of, and lays the tab out", async () => {
    const values = tradeLogTable([bbca]);
    values[1][values[0].indexOf("note")] = "edited before two-way sync";
    jest.mocked(readLog).mockResolvedValue(values);

    await syncNow();

    expect(usePlanStore.getState().plans[0].note).toBe("");
    expect(formatLogTab).not.toHaveBeenCalled(); // header already current
    expect(useSheetStore.getState().snapshots.s1).toEqual(snapshotOf([bbca]));
  });

  it("formats a tab whose header is not the current layout", async () => {
    jest.mocked(readLog).mockResolvedValue([["code", "entry"]]);

    await syncNow();

    expect(formatLogTab).toHaveBeenCalledWith(
      "tok",
      "s1",
      expect.arrayContaining(["id", "status"]),
    );
  });

  it("takes edits and new rows from the sheet, then writes the result back", async () => {
    act(() =>
      useSheetStore.setState({ snapshots: { s1: snapshotOf([bbca]) } }),
    );
    const values = tradeLogTable([bbca]);
    const header = values[0] as string[];
    values[1][header.indexOf("note")] = "From the sheet";
    const added = header.map(() => "" as string | number);
    added[header.indexOf("code")] = "TLKM";
    added[header.indexOf("entry")] = 3000;
    added[header.indexOf("stop_loss")] = 2900;
    values.push(added);
    jest.mocked(readLog).mockResolvedValue(values);

    await syncNow();

    const plans = usePlanStore.getState().plans;
    expect(plans.map((plan) => plan.code)).toEqual(["BBCA", "TLKM"]);
    expect(plans[0].note).toBe("From the sheet");

    const written = jest.mocked(writeLog).mock.calls[0][2];
    expect(written).toHaveLength(3);
    expect(useSheetStore.getState().snapshots.s1).toEqual(snapshotOf(plans));
  });

  it("reports sheet edits it could not take", async () => {
    act(() =>
      useSheetStore.setState({ snapshots: { s1: snapshotOf([bbca]) } }),
    );
    const values = tradeLogTable([bbca]);
    values[1][values[0].indexOf("entry")] = 9010;
    jest.mocked(readLog).mockResolvedValue(values);

    await syncNow();

    expect(usePlanStore.getState().plans[0].entry).toBe(9000);
    expect(useSheetStore.getState().rejections).toEqual([
      { row: 2, code: "BBCA", reason: "tickInvalid" },
    ]);
  });
});
