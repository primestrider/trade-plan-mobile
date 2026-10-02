import { Host, Slider, Switch } from "@expo/ui";
import { Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import {
  formatPercentValue,
  formatRupiah,
} from "@/features/trade-log/helpers/format";
import {
  AppText,
  Button,
  Dialog,
  ListItem,
  Screen,
  useToast,
} from "@/shared/components";
import { formatDate } from "@/shared/helpers";
import { maxLossPerTrade, RISK_PERCENT, useProfileStore } from "@/shared/stores";
import { text, useStyles, useTheme, view } from "@/styles";
import { fontSize, letterSpacing } from "@/styles/tokens";
import { fontFamily } from "@/styles/tokens/typography";

import type { Backup } from "../models/backup";
import {
  exportBackup,
  exportCsv,
  pickBackup,
  restoreBackup,
} from "../services/backup";

type RiskLevel = "conservative" | "standard" | "aggressive";

const levelOf = (percent: number): RiskLevel =>
  percent <= 1 ? "conservative" : percent < 3 ? "standard" : "aggressive";

const levelColor = {
  conservative: "success",
  standard: "primary",
  aggressive: "warning",
} as const;

/**
 * Where the user sets how much of their capital one trade may lose.
 *
 * The percentage is the one large thing on the page; the slider beneath it is
 * the platform's own (SwiftUI / Compose via `@expo/ui`), stepped so it can
 * only land on values the store accepts. Changes save as they are made, the
 * way a settings screen is expected to behave.
 */
export function SettingsScreen() {
  const styles = useStyles();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const balance = useProfileStore((state) => state.balance);
  const riskPercent = useProfileStore((state) => state.riskPercent);
  const setRiskPercent = useProfileStore((state) => state.setRiskPercent);
  const streakGuard = useProfileStore((state) => state.streakGuard);
  const setStreakGuard = useProfileStore((state) => state.setStreakGuard);

  const level = levelOf(riskPercent);

  return (
    <>
      <Stack.Screen options={{ title: t("features.settings.title") }} />

      <Screen>
        <AppText variant="title">{t("features.settings.risk.title")}</AppText>
        <AppText color="muted" style={text(styles.mt1)}>
          {t("features.settings.risk.description")}
        </AppText>

        <View style={view(styles.itemsCenter, styles.mt8)}>
          <AppText
            accessibilityLiveRegion="polite"
            style={{
              fontSize: fontSize["6xl"],
              lineHeight: fontSize["6xl"] * 1.1,
              fontFamily: fontFamily.extrabold,
              letterSpacing: letterSpacing.tighter,
              fontVariant: ["tabular-nums"],
              color: colors.foreground,
            }}
          >
            {formatPercentValue(riskPercent)}
          </AppText>
          <AppText variant="label" color={levelColor[level]}>
            {t(`features.settings.risk.level.${level}`)}
          </AppText>
        </View>

        <Host
          matchContents={{ vertical: true }}
          seedColor={colors.primary}
          colorScheme={isDark ? "dark" : "light"}
          style={view(styles.mt6)}
        >
          <Slider
            testID="risk-slider"
            value={riskPercent}
            onValueChange={setRiskPercent}
            min={RISK_PERCENT.min}
            max={RISK_PERCENT.max}
            step={RISK_PERCENT.step}
          />
        </Host>

        <View style={view(styles.flexRow, styles.justifyBetween, styles.mt1)}>
          <AppText variant="caption" color="muted">
            {formatPercentValue(RISK_PERCENT.min)}
          </AppText>
          <AppText variant="caption" color="muted">
            {formatPercentValue(RISK_PERCENT.max)}
          </AppText>
        </View>

        <View style={view(styles.mt8, styles.borderT, styles.borderBorder)}>
          {(
            [
              [
                t("features.settings.risk.maxLoss"),
                formatRupiah(maxLossPerTrade(balance, riskPercent)),
              ],
              [t("features.settings.risk.capital"), formatRupiah(balance)],
            ] as const
          ).map(([label, value]) => (
            <View
              key={label}
              style={view(
                styles.flexRow,
                styles.justifyBetween,
                styles.py3,
                styles.borderB,
                styles.borderBorder,
              )}
            >
              <AppText color="muted">{label}</AppText>
              <AppText variant="label" style={{ fontVariant: ["tabular-nums"] }}>
                {value}
              </AppText>
            </View>
          ))}
        </View>

        <AppText style={text(styles.mt4)}>
          {t(`features.settings.risk.advice.${level}`)}
        </AppText>

        <View
          style={view(styles.flexRow, styles.itemsCenter, styles.gap4, styles.mt10)}
        >
          <View style={styles.flex1}>
            <AppText variant="title">
              {t("features.settings.streakGuard.title")}
            </AppText>
            <AppText color="muted" style={text(styles.mt1)}>
              {t("features.settings.streakGuard.description")}
            </AppText>
          </View>
          <Host
            matchContents
            seedColor={colors.primary}
            colorScheme={isDark ? "dark" : "light"}
          >
            <Switch
              testID="streak-guard-switch"
              value={streakGuard}
              onValueChange={setStreakGuard}
            />
          </Host>
        </View>

        <DataSection />
      </Screen>
    </>
  );
}

/**
 * Backup, export and restore. Plans live only in this phone's storage, so the
 * section says that plainly, above the actions that guard against it.
 *
 * Restoring replaces everything, so it is confirmed first, naming what the
 * file holds.
 */
function DataSection() {
  const styles = useStyles();
  const { t } = useTranslation();
  const toast = useToast();
  const [pending, setPending] = useState<Backup | null>(null);

  const run = (task: () => Promise<void>) => async () => {
    try {
      await task();
    } catch {
      toast.error(t("features.settings.data.failed"));
    }
  };

  const chooseFile = run(async () => {
    const result = await pickBackup();

    if (result.status === "invalid") {
      toast.error(t("features.settings.data.invalid"));
    } else if (result.status === "picked") {
      setPending(result.backup);
    }
  });

  const confirmRestore = () => {
    if (pending) restoreBackup(pending);
    setPending(null);
    toast.success(t("features.settings.data.restored"));
  };

  return (
    <View style={styles.mt10}>
      <AppText variant="title">{t("features.settings.data.title")}</AppText>
      <AppText color="muted" style={text(styles.mt1, styles.mb2)}>
        {t("features.settings.data.description")}
      </AppText>

      <ListItem
        title={t("features.settings.data.backup")}
        subtitle={t("features.settings.data.backupHint")}
        showChevron
        onPress={run(exportBackup)}
      />
      <ListItem
        title={t("features.settings.data.csv")}
        subtitle={t("features.settings.data.csvHint")}
        showChevron
        onPress={run(exportCsv)}
      />
      <ListItem
        title={t("features.settings.data.restore")}
        subtitle={t("features.settings.data.restoreHint")}
        showChevron
        onPress={chooseFile}
      />

      <Dialog visible={pending !== null} onClose={() => setPending(null)}>
        <Dialog.Title>
          {t("features.settings.data.restoreDialog.title")}
        </Dialog.Title>
        <Dialog.Body>
          {t("features.settings.data.restoreDialog.body", {
            date: pending ? formatDate(pending.exportedAt) : "",
            count: pending?.plans.length ?? 0,
          })}
        </Dialog.Body>
        <Dialog.Actions>
          <Button
            variant="ghost"
            title={t("utils.action.cancel")}
            onPress={() => setPending(null)}
          />
          <Button
            variant="destructive"
            title={t("features.settings.data.restoreDialog.action")}
            onPress={confirmRestore}
          />
        </Dialog.Actions>
      </Dialog>
    </View>
  );
}
