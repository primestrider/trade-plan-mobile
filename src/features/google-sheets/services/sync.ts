import {
  GoogleOneTapSignIn,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
  statusCodes,
} from "react-native-nitro-google-signin";

import type { Stock } from "@/features/search/models/api.model";
import { effectiveRisk } from "@/features/trade-log/models/plan";
import { tradeLogTable, type Cell } from "@/features/trade-log/models/table";
import { newPlanId, usePlanStore } from "@/features/trade-log/stores/plan.store";
import { DRIVE_FILE_SCOPE, ensureGoogleConfigured } from "@/plugins/google";
import { queryClient } from "@/plugins/react-query";
import { useProfileStore } from "@/shared/stores";

import { mergeSheet, snapshotOf, type Rejection } from "../models/merge";

import {
  selectSpreadsheet,
  useSheetStore,
  type SyncError,
} from "../stores/sheet.store";
import {
  addLogTab,
  createSpreadsheet,
  formatLogTab,
  readLog,
  SheetsError,
  writeLog,
  type Spreadsheet,
} from "./sheets";

export type ConnectResult = "connected" | "cancelled";

/**
 * Signs in with Google and asks for access to files this app creates.
 *
 * Tries the quiet path first (an account already used with the app), then
 * the account chooser. Declining the Drive consent counts as cancelling:
 * a signed-in account the app cannot write to would only fail later.
 */
export async function connectGoogle(): Promise<ConnectResult> {
  ensureGoogleConfigured();
  await GoogleOneTapSignIn.checkPlayServices();

  let response = await GoogleOneTapSignIn.signIn();
  if (isNoSavedCredentialFoundResponse(response)) {
    response = await GoogleOneTapSignIn.createAccount();
  }
  if (!isSuccessResponse(response) || !response.data) return "cancelled";

  if (!response.data.scopes.includes(DRIVE_FILE_SCOPE)) {
    // iOS reports a declined consent as a null token, Android by throwing.
    let accessToken: string | null;
    try {
      ({ accessToken } = await GoogleOneTapSignIn.requestScopes([
        DRIVE_FILE_SCOPE,
      ]));
    } catch (error) {
      await GoogleOneTapSignIn.signOut();
      if (isCancel(error)) return "cancelled";
      throw error;
    }

    if (!accessToken) {
      await GoogleOneTapSignIn.signOut();
      return "cancelled";
    }
  }

  const { id, email, name, photo } = response.data.user;
  useSheetStore.getState().setAccount({ id, email, name, photo });
  void syncNow();

  return "connected";
}

/**
 * Signs out and revokes the app's access. The spreadsheet stays in the
 * user's Drive, theirs to keep; only the app stops writing to it.
 */
export async function disconnectGoogle() {
  const account = useSheetStore.getState().account;

  ensureGoogleConfigured();
  try {
    if (account) await GoogleOneTapSignIn.revokeAccess(account.id);
  } finally {
    await GoogleOneTapSignIn.signOut().catch(() => undefined);
    useSheetStore.getState().setAccount(null);
  }
}

const isCancel = (error: unknown) =>
  isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED;

async function accessToken(): Promise<string> {
  ensureGoogleConfigured();
  return (await GoogleOneTapSignIn.getTokens()).accessToken;
}

/**
 * One full sync, recovering from what users and Google do to a spreadsheet
 * over time: an expired token is refreshed once, a deleted file is made
 * again, a deleted or renamed tab is added back.
 *
 * Read, merge, write. The sheet is read and merged into the app against the
 * snapshot of the last write (see `mergeSheet`); then the app's plans, now
 * including what the sheet added, are written back whole, and become the
 * next snapshot. A sheet with no snapshot yet — new, or made before two-way
 * sync — is only written: there is no base to tell its edits apart.
 */
async function syncOnce(accountId: string) {
  const sheetStore = useSheetStore.getState();
  let token = await accessToken();

  const withFreshToken = async <T>(call: () => Promise<T>): Promise<T> => {
    try {
      return await call();
    } catch (error) {
      if (!(error instanceof SheetsError) || error.kind !== "unauthorized") {
        throw error;
      }
      await GoogleOneTapSignIn.clearCachedAccessToken(token);
      token = await accessToken();
      return call();
    }
  };

  const create = async (): Promise<Spreadsheet> => {
    const created = await withFreshToken(() => createSpreadsheet(token));
    sheetStore.setSpreadsheet(accountId, created);
    return created;
  };

  let sheet = selectSpreadsheet(useSheetStore.getState()) ?? (await create());
  let values: Cell[][] = [];

  try {
    values = await withFreshToken(() => readLog(token, sheet.spreadsheetId));
  } catch (error) {
    if (!(error instanceof SheetsError)) throw error;

    if (error.kind === "notFound" || error.kind === "forbidden") {
      sheet = await create();
    } else if (error.kind === "missingTab") {
      await withFreshToken(() => addLogTab(token, sheet.spreadsheetId));
    } else {
      throw error;
    }
  }

  const snapshot = useSheetStore.getState().snapshots[sheet.spreadsheetId];
  let rejections: Rejection[] = [];

  if (snapshot && values.length > 0) {
    const { balance, riskPercent, streakGuard } = useProfileStore.getState();
    const plans = usePlanStore.getState().plans;
    const merged = mergeSheet({
      values,
      plans,
      snapshot,
      balance,
      riskPercent: effectiveRisk(plans, riskPercent, streakGuard).percent,
      names: stockNames(),
      now: new Date().toISOString(),
      newId: newPlanId,
    });

    if (merged) {
      rejections = merged.rejections;
      if (merged.patches.length > 0 || merged.additions.length > 0) {
        applyingSheet = true;
        try {
          usePlanStore.getState().mergeFromSheet(merged.patches, merged.additions);
        } finally {
          applyingSheet = false;
        }
      }
    }
  }

  const plans = usePlanStore.getState().plans;
  const table = tradeLogTable(plans);
  await withFreshToken(() => writeLog(token, sheet.spreadsheetId, table));

  // A fresh tab, or one laid out by an older version: hide the id column
  // and add the status dropdown.
  const header = table[0] as string[];
  const laidOut =
    values[0]?.length === header.length &&
    header.every((name, index) => values[0][index] === name);
  if (!laidOut) {
    await withFreshToken(() => formatLogTab(token, sheet.spreadsheetId, header));
  }

  useSheetStore
    .getState()
    .syncSucceeded(sheet.spreadsheetId, snapshotOf(plans), rejections);
}

/** Company names from the stock list, if search has loaded it this run. */
function stockNames(): Map<string, string> {
  const stocks = queryClient.getQueryData<Stock[]>(["stocks", "list"]) ?? [];
  return new Map(stocks.map((stock) => [stock.Code, stock.Name]));
}

/**
 * True while plans are being changed by the sync itself, so the auto-sync
 * does not answer the sheet's own edits with another round.
 */
let applyingSheet = false;
export const isApplyingSheet = () => applyingSheet;

function syncErrorOf(error: unknown): SyncError {
  if (error instanceof SheetsError) {
    if (error.kind === "offline") return "offline";
    if (error.kind === "unauthorized" || error.kind === "forbidden") {
      return "reconnect";
    }
  }
  if (
    isErrorWithCode(error) &&
    (error.code === statusCodes.SIGN_IN_REQUIRED ||
      error.code === statusCodes.SIGN_IN_CANCELLED)
  ) {
    return "reconnect";
  }

  return "unknown";
}

let running: Promise<void> | null = null;
let queued = false;

/**
 * Syncs the trade log with the connected account's spreadsheet, both ways.
 *
 * Never runs twice at once: a call made mid-sync is folded into one more
 * pass after the current one, so the last write always reflects the latest
 * plans. Does nothing while no account is connected. Failures are recorded
 * in the store for the profile screen, never thrown.
 */
export function syncNow(): Promise<void> {
  if (running) {
    queued = true;
    return running;
  }

  running = (async () => {
    do {
      queued = false;
      const account = useSheetStore.getState().account;
      if (!account) break;

      useSheetStore.getState().syncStarted();
      try {
        await syncOnce(account.id);
      } catch (error) {
        useSheetStore.getState().syncFailed(syncErrorOf(error));
        break;
      }
    } while (queued);
  })().finally(() => {
    running = null;
  });

  return running;
}
