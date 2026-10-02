import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { usePlanStore } from "@/features/trade-log/stores/plan.store";
import { clampRiskPercent, useProfileStore } from "@/shared/stores";

import { buildBackup, parseBackup, toCsv, type Backup } from "../models/backup";

const today = () => new Date().toISOString().slice(0, 10);

/** Writes `text` to a fresh file in the cache and opens the share sheet. */
async function share(
  fileName: string,
  text: string,
  mimeType: string,
  UTI: string,
) {
  const file = new File(Paths.cache, fileName);

  if (file.exists) file.delete();
  file.create();
  file.write(text);

  await Sharing.shareAsync(file.uri, { mimeType, UTI });
}

/**
 * Hands the user a JSON file holding their profile and every plan, to keep
 * wherever they like (Drive, email, Files). Data otherwise lives only on the
 * device and is gone with the app.
 */
export async function exportBackup() {
  const { name, balance, riskPercent, streakGuard } =
    useProfileStore.getState();
  const backup = buildBackup(
    { name, balance, riskPercent, streakGuard },
    usePlanStore.getState().plans,
  );

  await share(
    `trade-plan-backup-${today()}.json`,
    JSON.stringify(backup, null, 2),
    "application/json",
    "public.json",
  );
}

/** Hands the user the trade log as a CSV file for a spreadsheet. */
export async function exportCsv() {
  await share(
    `trade-log-${today()}.csv`,
    toCsv(usePlanStore.getState().plans),
    "text/csv",
    "public.comma-separated-values-text",
  );
}

export type PickResult =
  | { status: "cancelled" }
  | { status: "invalid" }
  | { status: "picked"; backup: Backup };

/**
 * Lets the user choose a backup file and reads it. Nothing is replaced yet:
 * the caller confirms with the user first, then calls `restoreBackup`.
 *
 * Any file type is allowed in the picker, because Android often labels a
 * downloaded `.json` as a generic binary; the content decides instead.
 */
export async function pickBackup(): Promise<PickResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });

  if (result.canceled) return { status: "cancelled" };

  const backup = parseBackup(await new File(result.assets[0].uri).text());

  return backup ? { status: "picked", backup } : { status: "invalid" };
}

/** Replaces the profile and every plan with the backup's. */
export function restoreBackup({ profile, plans }: Backup) {
  useProfileStore.setState({
    name: profile.name,
    balance: profile.balance,
    riskPercent: clampRiskPercent(profile.riskPercent),
    streakGuard: profile.streakGuard,
    hasCompletedOnboarding: true,
  });
  usePlanStore.getState().replacePlans(plans);
}
