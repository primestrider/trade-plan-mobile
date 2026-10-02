import axios, { isAxiosError } from "axios";

import type { Cell } from "@/features/trade-log/models/table";

const BASE = "https://sheets.googleapis.com/v4/spreadsheets";

/** The spreadsheet's title in Drive, and the tab the log is written to. */
export const SPREADSHEET_TITLE = "Trade Plan – Trade log";
export const LOG_TAB = "Trade log";

/** A1 reference to the whole log tab; the quotes allow the space. */
const TAB_RANGE = encodeURIComponent(`'${LOG_TAB}'`);

export type Spreadsheet = { spreadsheetId: string; spreadsheetUrl: string };

/**
 * Why a Sheets call failed, in the terms the sync acts on:
 * - `unauthorized`: the access token was rejected; refresh it and retry.
 * - `forbidden`: the account no longer grants this app access to the file.
 * - `notFound`: the spreadsheet was deleted.
 * - `missingTab`: the log tab was renamed or deleted.
 * - `offline`: no response at all.
 */
export type SheetsErrorKind =
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "missingTab"
  | "offline"
  | "unknown";

export class SheetsError extends Error {
  constructor(readonly kind: SheetsErrorKind, message: string) {
    super(message);
    this.name = "SheetsError";
  }
}

function toSheetsError(error: unknown): SheetsError {
  if (!isAxiosError(error)) {
    return new SheetsError("unknown", String(error));
  }

  const status = error.response?.status;
  const message: string =
    error.response?.data?.error?.message ?? error.message ?? "Sheets request failed";

  if (!error.response) return new SheetsError("offline", message);
  if (status === 401) return new SheetsError("unauthorized", message);
  if (status === 403) return new SheetsError("forbidden", message);
  if (status === 404) return new SheetsError("notFound", message);
  if (status === 400 && /parse range/i.test(message)) {
    return new SheetsError("missingTab", message);
  }

  return new SheetsError("unknown", message);
}

async function request<T>(
  token: string,
  method: "GET" | "POST" | "PUT",
  url: string,
  data?: unknown,
): Promise<T> {
  try {
    const response = await axios.request<T>({
      method,
      url,
      data,
      timeout: 15_000,
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    throw toSheetsError(error);
  }
}

const logTab = {
  properties: { title: LOG_TAB, gridProperties: { frozenRowCount: 1 } },
};

/** Creates the app's spreadsheet in the user's Drive, with the log tab. */
export function createSpreadsheet(token: string): Promise<Spreadsheet> {
  return request<Spreadsheet>(token, "POST", BASE, {
    properties: { title: SPREADSHEET_TITLE },
    sheets: [logTab],
  });
}

/** Re-adds the log tab after the user renamed or deleted it. */
export async function addLogTab(token: string, spreadsheetId: string) {
  await request(token, "POST", `${BASE}/${spreadsheetId}:batchUpdate`, {
    requests: [{ addSheet: logTab }],
  });
}

/**
 * Replaces the log tab's contents with `table`.
 *
 * Cleared first, so a deleted plan does not linger in a row below the new
 * end. Written `RAW`: a note typed as `=IMPORTXML(…)` stays text instead of
 * running as a formula in the user's sheet.
 */
export async function writeLog(
  token: string,
  spreadsheetId: string,
  table: Cell[][],
) {
  await request(token, "POST", `${BASE}/${spreadsheetId}/values/${TAB_RANGE}:clear`);
  await request(
    token,
    "PUT",
    `${BASE}/${spreadsheetId}/values/${TAB_RANGE}!A1?valueInputOption=RAW`,
    {
      range: `'${LOG_TAB}'!A1`,
      majorDimension: "ROWS",
      values: table.map((row) => row.map((cell) => cell ?? "")),
    },
  );
}

/**
 * Reads the log tab as values: numbers as numbers, text as text, so a price
 * typed as `9.000` in an Indonesian-locale sheet arrives as 9000.
 */
export async function readLog(token: string, spreadsheetId: string): Promise<Cell[][]> {
  const response = await request<{ values?: Cell[][] }>(
    token,
    "GET",
    `${BASE}/${spreadsheetId}/values/${TAB_RANGE}?valueRenderOption=UNFORMATTED_VALUE`,
  );

  return response.values ?? [];
}

/** The numeric id of the log tab, which formatting requests address it by. */
async function logSheetId(token: string, spreadsheetId: string): Promise<number> {
  const response = await request<{
    sheets?: { properties: { sheetId: number; title: string } }[];
  }>(token, "GET", `${BASE}/${spreadsheetId}?fields=sheets.properties`);

  const tab = response.sheets?.find((sheet) => sheet.properties.title === LOG_TAB);
  if (!tab) throw new SheetsError("missingTab", `No ${LOG_TAB} tab`);

  return tab.properties.sheetId;
}

/**
 * Lays the log tab out for editing by hand: the `id` column hidden (it is
 * how rows find their plans, not something to read), the header frozen, and
 * the status column limited to the three values the app understands.
 * Every request sets a value rather than adding one, so it is safe to repeat.
 */
export async function formatLogTab(
  token: string,
  spreadsheetId: string,
  header: readonly string[],
) {
  const sheetId = await logSheetId(token, spreadsheetId);
  const statusColumn = header.indexOf("status");

  await request(token, "POST", `${BASE}/${spreadsheetId}:batchUpdate`, {
    requests: [
      {
        updateSheetProperties: {
          properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
          fields: "gridProperties.frozenRowCount",
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
          properties: { hiddenByUser: true },
          fields: "hiddenByUser",
        },
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: "COLUMNS",
            startIndex: 1,
            endIndex: header.length,
          },
          properties: { hiddenByUser: false },
          fields: "hiddenByUser",
        },
      },
      {
        setDataValidation: {
          range: {
            sheetId,
            startRowIndex: 1,
            startColumnIndex: statusColumn,
            endColumnIndex: statusColumn + 1,
          },
          rule: {
            condition: {
              type: "ONE_OF_LIST",
              values: ["planned", "open", "closed"].map((value) => ({
                userEnteredValue: value,
              })),
            },
            strict: true,
            showCustomUi: true,
          },
        },
      },
    ],
  });
}
