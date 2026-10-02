import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AppText, EmptyState, Screen } from "@/shared/components";
import { formatNumber } from "@/shared/helpers";
import { useProfileStore } from "@/shared/stores";
import { text, useStyles, view } from "@/styles";
import { fontSize, letterSpacing } from "@/styles/tokens";
import { fontFamily } from "@/styles/tokens/typography";

import { formatPercentValue, formatR, formatRupiah } from "../helpers/format";
import { tradeStats } from "../models/stats";
import { usePlanStore } from "../stores/plan.store";
import { EquityCurve } from "./EquityCurve";

type Tone = "foreground" | "success" | "destructive";

const toneOf = (value: number | null): Tone =>
  !value ? "foreground" : value > 0 ? "success" : "destructive";

/**
 * How the closed trades went, read in the order a trader judges a method:
 * the money first, then its path (the curve and the worst fall along it),
 * then whether the edge is real (expectancy, profit factor) and how wins and
 * losses compare in size.
 */
export function StatsScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const plans = usePlanStore((state) => state.plans);
  const balance = useProfileStore((state) => state.balance);
  const stats = tradeStats(plans);

  if (!stats) {
    return (
      <>
        <Stack.Screen options={{ title: t("features.tradeLog.stats.title") }} />
        <Screen>
          <EmptyState
            title={t("features.tradeLog.stats.empty.title")}
            description={t("features.tradeLog.stats.empty.description")}
          />
        </Screen>
      </>
    );
  }

  const r = (value: number | null) => (value === null ? "-" : formatR(value));
  const decimal = (value: number | null) =>
    value === null
      ? "-"
      : formatNumber(value, { language: "id", maximumFractionDigits: 2 });

  const metrics: [string, string, Tone][] = [
    [t("features.tradeLog.performance.winRate"), formatPercentValue(stats.winRate * 100), "foreground"],
    [t("features.tradeLog.stats.expectancy"), r(stats.expectancyR), toneOf(stats.expectancyR)],
    [t("features.tradeLog.stats.profitFactor"), decimal(stats.profitFactor), "foreground"],
    [
      t("features.tradeLog.stats.maxDrawdown"),
      stats.maxDrawdown === 0
        ? formatRupiah(0)
        : `-${formatRupiah(stats.maxDrawdown)}`,
      stats.maxDrawdown > 0 ? "destructive" : "foreground",
    ],
    [t("features.tradeLog.stats.averageWin"), r(stats.averageWinR), "success"],
    [t("features.tradeLog.stats.averageLoss"), r(stats.averageLossR), "destructive"],
    [t("features.tradeLog.stats.best"), r(stats.bestR), toneOf(stats.bestR)],
    [t("features.tradeLog.stats.worst"), r(stats.worstR), toneOf(stats.worstR)],
  ];

  return (
    <>
      <Stack.Screen options={{ title: t("features.tradeLog.stats.title") }} />

      <Screen>
        <AppText color="muted">{t("features.tradeLog.stats.total")}</AppText>
        <AppText
          color={toneOf(stats.totalProfit)}
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            fontSize: fontSize["4xl"],
            lineHeight: fontSize["4xl"] * 1.1,
            fontFamily: fontFamily.extrabold,
            letterSpacing: letterSpacing.tighter,
            fontVariant: ["tabular-nums"],
          }}
        >
          {stats.totalProfit > 0 ? "+" : ""}
          {formatRupiah(stats.totalProfit)}
        </AppText>
        <AppText color="muted" style={text(styles.mt1)}>
          {t("features.tradeLog.stats.totalOf", {
            count: stats.trades,
            wins: stats.wins,
            percent: formatPercentValue(
              balance > 0 ? (stats.totalProfit / balance) * 100 : 0,
            ),
          })}
        </AppText>

        <View style={styles.mt8}>
          <AppText variant="title">{t("features.tradeLog.stats.curve")}</AppText>
          <View style={styles.mt2}>
            <EquityCurve curve={stats.curve} />
          </View>
        </View>

        <View style={view(styles.flexRow, styles.flexWrap, styles.mt8)}>
          {metrics.map(([label, value, tone]) => (
            <View
              key={label}
              style={view(styles.py3, styles.borderT, styles.borderBorder, {
                width: "50%",
              })}
            >
              <AppText variant="caption" color="muted">
                {label}
              </AppText>
              <AppText
                variant="title"
                color={tone}
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {value}
              </AppText>
            </View>
          ))}
        </View>

        <AppText variant="caption" color="muted" style={text(styles.mt4)}>
          {t("features.tradeLog.stats.explain")}
        </AppText>
      </Screen>
    </>
  );
}
