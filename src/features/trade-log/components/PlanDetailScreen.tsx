import { useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { formatPrice } from "@/features/search/helpers/stock";
import type { Stock } from "@/features/search/models/api.model";
import {
  AppText,
  Badge,
  Button,
  Dialog,
  EmptyState,
  Screen,
} from "@/shared/components";
import { formatDate } from "@/shared/helpers";
import { useProfileStore } from "@/shared/stores";
import { useStyles, view } from "@/styles";

import {
  formatPercentValue,
  formatR,
  formatRewardRatio,
  formatRupiah,
} from "../helpers/format";
import {
  planRisk,
  realizedProfit,
  rewardRatio,
  rMultiple,
  SHARES_PER_LOT,
  type TradePlan,
} from "../models/plan";
import { usePlanStore } from "../stores/plan.store";
import { ClosePositionSheet } from "./ClosePositionSheet";

export type PlanDetailScreenProps = { id: string };

/**
 * One plan, and the next step it can take: a planned trade is bought, an open
 * one is closed, and either can be edited or deleted.
 */
export function PlanDetailScreen({ id }: Readonly<PlanDetailScreenProps>) {
  const { t } = useTranslation();
  const plan = usePlanStore((state) =>
    state.plans.find((item) => item.id === id),
  );

  return (
    <>
      <Stack.Screen
        options={{ title: plan?.code ?? t("features.tradeLog.detail.title") }}
      />
      <Screen>
        {plan ? (
          <PlanDetail plan={plan} />
        ) : (
          <EmptyState title={t("features.tradeLog.detail.notFound")} />
        )}
      </Screen>
    </>
  );
}

function PlanDetail({ plan }: Readonly<{ plan: TradePlan }>) {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const balance = useProfileStore((state) => state.balance);
  const openPlan = usePlanStore((state) => state.openPlan);
  const removePlan = usePlanStore((state) => state.removePlan);
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const lastPrice = queryClient
    .getQueryData<Stock[]>(["stocks", "list"])
    ?.find((stock) => stock.Code === plan.code)?.Last;

  const risk = planRisk(plan);
  const ratio = rewardRatio(plan);
  const profit = realizedProfit(plan);
  const r = rMultiple(plan);

  const rows: [string, string][] = [
    [t("features.tradeLog.price.entry"), formatPrice(plan.entry)],
    [t("features.tradeLog.price.stopLoss"), formatPrice(plan.stopLoss)],
    [
      t("features.tradeLog.price.target"),
      plan.target === null ? "-" : formatPrice(plan.target),
    ],
    [t("features.tradeLog.form.lots"), t("features.tradeLog.lots", { count: plan.lots })],
    [
      t("features.tradeLog.form.cost"),
      formatRupiah(plan.entry * plan.lots * SHARES_PER_LOT),
    ],
    [
      t("features.tradeLog.form.risk"),
      `${formatRupiah(risk)} (${formatPercentValue((risk / balance) * 100)})`,
    ],
  ];

  if (ratio !== null) {
    rows.push([t("features.tradeLog.form.reward"), formatRewardRatio(ratio)]);
  }

  if (plan.exitPrice !== null) {
    rows.splice(3, 0, [t("features.tradeLog.price.exit"), formatPrice(plan.exitPrice)]);
  }

  const history = [
    t("features.tradeLog.detail.planned", { date: formatDate(plan.createdAt) }),
    plan.openedAt &&
      t("features.tradeLog.detail.opened", { date: formatDate(plan.openedAt) }),
    plan.closedAt &&
      t("features.tradeLog.detail.closed", { date: formatDate(plan.closedAt) }),
  ].filter(Boolean);

  const confirmDelete = () => {
    setIsDeleting(false);
    removePlan(plan.id);
    router.back();
  };

  return (
    <View style={styles.gap6}>
      <View>
        <View style={view(styles.flexRow, styles.itemsCenter, styles.gap2)}>
          <AppText variant="h2">{plan.code}</AppText>
          <Badge
            size="sm"
            variant={plan.status === "open" ? "primary" : plan.status === "planned" ? "outline" : "default"}
            label={t(`features.tradeLog.status.${plan.status}`)}
          />
        </View>
        {plan.name ? <AppText color="muted">{plan.name}</AppText> : null}
      </View>

      {profit !== null && r !== null ? (
        <View>
          <AppText color="muted">{t("features.tradeLog.detail.profit")}</AppText>
          <AppText
            variant="h1"
            color={profit > 0 ? "success" : profit < 0 ? "destructive" : "foreground"}
          >
            {formatR(r)}
          </AppText>
          <AppText color={profit > 0 ? "success" : profit < 0 ? "destructive" : "muted"}>
            {profit > 0 ? "+" : ""}
            {formatRupiah(profit)}
          </AppText>
        </View>
      ) : null}

      <View>
        {rows.map(([label, value]) => (
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

      {plan.note ? (
        <View>
          <AppText color="muted">{t("features.tradeLog.detail.note")}</AppText>
          <AppText style={styles.mt1}>{plan.note}</AppText>
        </View>
      ) : null}

      <View style={styles.gap1}>
        {history.map((line) => (
          <AppText key={line as string} variant="caption" color="muted">
            {line}
          </AppText>
        ))}
      </View>

      <View style={styles.gap3}>
        {plan.status === "planned" ? (
          <Button
            block
            title={t("features.tradeLog.action.open")}
            onPress={() => openPlan(plan.id)}
          />
        ) : null}
        {plan.status === "open" ? (
          <Button
            block
            title={t("features.tradeLog.action.close")}
            onPress={() => setIsClosing(true)}
          />
        ) : null}
        {plan.status !== "closed" ? (
          <Button
            block
            variant="outline"
            title={t("features.tradeLog.action.edit")}
            onPress={() =>
              router.push({
                pathname: "/plan/[id]/edit",
                params: { id: plan.id },
              })
            }
          />
        ) : null}
        <Button
          block
          variant="ghost"
          title={t("features.tradeLog.action.delete")}
          onPress={() => setIsDeleting(true)}
        />
      </View>

      <ClosePositionSheet
        visible={isClosing}
        onClose={() => setIsClosing(false)}
        plan={plan}
        suggestedPrice={lastPrice}
      />

      <Dialog visible={isDeleting} onClose={() => setIsDeleting(false)}>
        <Dialog.Title>{t("features.tradeLog.deleteDialog.title")}</Dialog.Title>
        <Dialog.Body>{t("features.tradeLog.deleteDialog.body")}</Dialog.Body>
        <Dialog.Actions>
          <Button
            variant="ghost"
            title={t("utils.action.cancel")}
            onPress={() => setIsDeleting(false)}
          />
          <Button
            variant="destructive"
            title={t("utils.action.delete")}
            onPress={confirmDelete}
          />
        </Dialog.Actions>
      </Dialog>
    </View>
  );
}
