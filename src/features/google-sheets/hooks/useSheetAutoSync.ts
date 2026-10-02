import { useEffect } from "react";
import { AppState } from "react-native";

import { usePlanStore } from "@/features/trade-log/stores/plan.store";

import { isApplyingSheet, syncNow } from "../services/sync";
import { useSheetStore } from "../stores/sheet.store";

/** Long enough to fold a burst of edits into one write. */
const DEBOUNCE_MS = 3000;

/**
 * Keeps the trade log and the Google Sheet in step while an account is
 * connected:
 * - a moment after the plans change in the app, to write them out;
 * - on launch and each time the app returns to the foreground, to take in
 *   what was edited in the sheet meanwhile.
 *
 * Changes the sync itself makes to the plans are not answered with another
 * round. Mounted once, where every signed-in screen is beneath it.
 */
export function useSheetAutoSync() {
  const connected = useSheetStore((state) => state.account !== null);

  useEffect(() => {
    if (!connected) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void syncNow(), DEBOUNCE_MS);
    };

    void syncNow();

    const unsubscribePlans = usePlanStore.subscribe((state, previous) => {
      if (state.plans !== previous.plans && !isApplyingSheet()) schedule();
    });

    const appState = AppState.addEventListener("change", (next) => {
      if (next === "active") void syncNow();
    });

    return () => {
      clearTimeout(timer);
      unsubscribePlans();
      appState.remove();
    };
  }, [connected]);
}
