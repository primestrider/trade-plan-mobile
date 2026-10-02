import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { formatPrice } from "@/features/search/helpers/stock";
import { AppText, Badge } from "@/shared/components";
import { useStyles, view } from "@/styles";

import { formatR, formatRupiah } from "../helpers/format";
import {
  planRisk,
  realizedProfit,
  rMultiple,
  type PlanStatus,
  type TradePlan,
} from "../models/plan";

const statusVariant: Record<PlanStatus, "outline" | "primary" | "default"> = {
  planned: "outline",
  open: "primary",
  closed: "default",
};

export type PlanRowProps = {
  plan: TradePlan;
  onPress: () => void;
};

/**
 * One plan in a list. The left side says what the plan is (code, status, the
 * three prices); the right side says what is at stake: the loss if stopped
 * out while the plan is live, the result once it is closed.
 */
export function PlanRow({ plan, onPress }: Readonly<PlanRowProps>) {
  const styles = useStyles();
  const { t } = useTranslation();

  const isClosed = plan.status === "closed";
  const profit = realizedProfit(plan) ?? 0;
  const r = rMultiple(plan);

  const prices: [string, number | null][] = [
    [t("features.tradeLog.price.entry"), plan.entry],
    [t("features.tradeLog.price.stopLoss"), plan.stopLoss],
    isClosed
      ? [t("features.tradeLog.price.exit"), plan.exitPrice]
      : [t("features.tradeLog.price.target"), plan.target],
  ];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) =>
        view(
          styles.py4,
          styles.borderB,
          styles.borderBorder,
          pressed && { opacity: 0.6 },
        )
      }
    >
      <View style={view(styles.flexRow, styles.itemsCenter, styles.gap2)}>
        <AppText variant="title">{plan.code}</AppText>
        <Badge
          size="sm"
          variant={statusVariant[plan.status]}
          label={t(`features.tradeLog.status.${plan.status}`)}
        />
        <View style={styles.flex1} />
        {isClosed ? (
          <AppText
            variant="title"
            color={profit > 0 ? "success" : profit < 0 ? "destructive" : "muted"}
          >
            {r === null ? "-" : formatR(r)}
          </AppText>
        ) : (
          <AppText variant="label" color="destructive">
            -{formatRupiah(planRisk(plan))}
          </AppText>
        )}
      </View>

      <View style={view(styles.flexRow, styles.gap4, styles.mt2)}>
        {prices.map(([label, value]) => (
          <View key={label}>
            <AppText variant="caption" color="muted">
              {label}
            </AppText>
            <AppText variant="label" style={{ fontVariant: ["tabular-nums"] }}>
              {value === null ? "-" : formatPrice(value)}
            </AppText>
          </View>
        ))}
        <View style={styles.flex1} />
        <View style={styles.itemsEnd}>
          <AppText variant="caption" color="muted">
            {t("features.tradeLog.form.lots")}
          </AppText>
          <AppText variant="label">
            {t("features.tradeLog.lots", { count: plan.lots })}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
