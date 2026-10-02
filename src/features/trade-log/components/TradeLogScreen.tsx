import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, SectionList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Button, EmptyState } from "@/shared/components";
import { useStyles, view } from "@/styles";
import { spacing } from "@/styles/tokens";

import { formatPercentValue, formatR } from "../helpers/format";
import { useEffectiveRisk } from "../hooks/useEffectiveRisk";
import {
  byRecent,
  LOSS_STREAK_LIMIT,
  performance,
  type TradePlan,
} from "../models/plan";
import { usePlanStore } from "../stores/plan.store";
import { OpenRiskNote } from "./OpenRiskNote";
import { PlanRow } from "./PlanRow";

/**
 * Every plan the user has written: the live ones (planned or bought) first,
 * the closed ones below, and above both how the closed ones went.
 *
 * The route hides its header, so the top inset is claimed here, as on the
 * home screen.
 */
export function TradeLogScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const plans = usePlanStore((state) => state.plans);

  const create = () => router.push("/plan/new");
  const show = (plan: TradePlan) =>
    router.push({ pathname: "/plan/[id]", params: { id: plan.id } });

  const sorted = [...plans].sort(byRecent);
  const sections = [
    {
      key: "active",
      title: t("features.tradeLog.section.active"),
      data: sorted.filter((plan) => plan.status !== "closed"),
    },
    {
      key: "closed",
      title: t("features.tradeLog.section.closed"),
      data: sorted.filter((plan) => plan.status === "closed"),
    },
  ].filter((section) => section.data.length > 0);

  return (
    <SafeAreaView
      edges={["top"]}
      style={view(styles.flex1, styles.bgBackground)}
    >
      <SectionList
        sections={sections}
        keyExtractor={(plan) => plan.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: spacing[4],
          paddingBottom: spacing[8],
        }}
        ListHeaderComponent={
          <View style={view(styles.gap4, styles.pt4)}>
            <View
              style={view(styles.flexRow, styles.itemsCenter, styles.justifyBetween)}
            >
              <AppText variant="h3">{t("features.tradeLog.title")}</AppText>
              {plans.length > 0 ? (
                <Button
                  size="sm"
                  variant="secondary"
                  title={t("features.tradeLog.action.create")}
                  onPress={create}
                />
              ) : null}
            </View>
            <PerformanceSummary plans={plans} />
            <OpenRiskNote />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <AppText variant="label" color="muted" style={{ marginTop: spacing[6] }}>
            {section.title}
          </AppText>
        )}
        renderItem={({ item }) => (
          <PlanRow plan={item} onPress={() => show(item)} />
        )}
        ListEmptyComponent={
          <EmptyState
            style={styles.mt8}
            title={t("features.tradeLog.empty.title")}
            description={t("features.tradeLog.empty.description")}
            action={
              <View style={styles.gap2}>
                <Button
                  title={t("features.tradeLog.empty.action")}
                  onPress={create}
                />
                <Button
                  title={t("features.tradeLog.empty.search")}
                  variant="ghost"
                  onPress={() => router.push("/search")}
                />
              </View>
            }
          />
        }
      />
    </SafeAreaView>
  );
}

/** Win rate, average R and the current losing run, once a trade is closed. */
function PerformanceSummary({ plans }: Readonly<{ plans: TradePlan[] }>) {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const risk = useEffectiveRisk();
  const result = performance(plans);

  if (!result) return null;

  const stats: [string, string, "foreground" | "success" | "destructive" | "warning"][] = [
    [
      t("features.tradeLog.performance.winRate"),
      formatPercentValue(result.winRate * 100),
      "foreground",
    ],
    [
      t("features.tradeLog.performance.averageR"),
      formatR(result.averageR),
      result.averageR > 0 ? "success" : result.averageR < 0 ? "destructive" : "foreground",
    ],
    [
      t("features.tradeLog.performance.lossStreak"),
      String(result.lossStreak),
      result.lossStreak >= LOSS_STREAK_LIMIT ? "warning" : "foreground",
    ],
  ];

  return (
    <View>
      <View style={view(styles.flexRow, styles.gap4)}>
        {stats.map(([label, value, color]) => (
          <View key={label} style={styles.flex1}>
            <AppText variant="caption" color="muted">
              {label}
            </AppText>
            <AppText variant="title" color={color}>
              {value}
            </AppText>
          </View>
        ))}
      </View>
      <AppText variant="caption" color="muted" style={{ marginTop: spacing[1] }}>
        {t("features.tradeLog.performance.trades", { count: result.trades })}
      </AppText>
      {result.lossStreak >= LOSS_STREAK_LIMIT ? (
        <AppText color="warning" style={{ marginTop: spacing[2] }}>
          {risk.lowered
            ? t("features.tradeLog.performance.streakGuarded", {
                percent: formatPercentValue(risk.percent),
              })
            : t("features.tradeLog.performance.streakAdvice")}
        </AppText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.push("/stats")}
        style={{ marginTop: spacing[3], alignSelf: "flex-start" }}
      >
        <AppText variant="label" color="primary">
          {t("features.tradeLog.performance.seeStats")}
        </AppText>
      </Pressable>
    </View>
  );
}
