import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "@/plugins/mmkv";
import { zustandStorage } from "@/plugins/mmkv/zustand";

import type { Rejection, Snapshot } from "../models/merge";
import type { Spreadsheet } from "../services/sheets";

export type GoogleAccount = {
  id: string;
  email: string | null;
  name: string | null;
  photo: string | null;
};

/** What went wrong with the last sync, as the profile screen explains it. */
export type SyncError = "offline" | "reconnect" | "unknown";

type SheetState = {
  account: GoogleAccount | null;
  /**
   * The spreadsheet made for each Google account, by account id. Kept per
   * account so disconnecting and connecting the same account again keeps
   * writing to the same file instead of starting a second one.
   */
  spreadsheets: Record<string, Spreadsheet>;
  /**
   * What each spreadsheet held after the last write, by spreadsheet id: the
   * base the next sync compares the sheet and the app against.
   */
  snapshots: Record<string, Snapshot>;
  /** Sheet edits the last sync could not take. */
  rejections: Rejection[];
  lastSyncedAt: string | null;
  syncing: boolean;
  error: SyncError | null;

  setAccount: (account: GoogleAccount | null) => void;
  setSpreadsheet: (accountId: string, spreadsheet: Spreadsheet | null) => void;
  syncStarted: () => void;
  syncSucceeded: (
    spreadsheetId: string,
    snapshot: Snapshot,
    rejections: Rejection[],
  ) => void;
  syncFailed: (error: SyncError) => void;
};

/**
 * The Google account the trade log syncs with, and how the last sync went.
 * The account, its spreadsheets, their snapshots and the last success are
 * kept between launches; an in-flight or failed sync, and the edits it
 * refused, are facts about this run.
 */
export const useSheetStore = create<SheetState>()(
  persist(
    (set) => ({
      account: null,
      spreadsheets: {},
      snapshots: {},
      rejections: [],
      lastSyncedAt: null,
      syncing: false,
      error: null,

      setAccount: (account) =>
        set({ account, error: null, rejections: [], lastSyncedAt: null }),

      setSpreadsheet: (accountId, spreadsheet) =>
        set((state) => {
          const spreadsheets = { ...state.spreadsheets };

          if (spreadsheet) spreadsheets[accountId] = spreadsheet;
          else delete spreadsheets[accountId];

          return { spreadsheets };
        }),

      syncStarted: () => set({ syncing: true }),
      syncSucceeded: (spreadsheetId, snapshot, rejections) =>
        set((state) => ({
          syncing: false,
          error: null,
          rejections,
          lastSyncedAt: new Date().toISOString(),
          snapshots: { ...state.snapshots, [spreadsheetId]: snapshot },
        })),
      syncFailed: (error) => set({ syncing: false, error }),
    }),
    {
      name: storageKeys.google.sheets,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ account, spreadsheets, snapshots, lastSyncedAt }) => ({
        account,
        spreadsheets,
        snapshots,
        lastSyncedAt,
      }),
    },
  ),
);

/** The spreadsheet of the connected account, if one has been made. */
export const selectSpreadsheet = (state: SheetState): Spreadsheet | null =>
  state.account ? (state.spreadsheets[state.account.id] ?? null) : null;
