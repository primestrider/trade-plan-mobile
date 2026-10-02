import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { AppText, Button } from "@/shared/components";
import { useStyles, view } from "@/styles";

import { byRecent } from "../models/plan";
import { usePlanStore } from "../stores/plan.store";
import { OpenRiskNote } from "./OpenRiskNote";
import { PlanRow } from "./PlanRow";

/** How many plans the home screen shows before "See all". */
const PREVIEW_COUNT = 3;

/**
 * The home screen's view of the trade log: the newest live plans and what the
 * open ones put at risk together. The full list is one tap away.
 */
export function ActivePlans() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const plans = usePlanStore((state) => state.plans);

  const active = plans
    .filter((plan) => plan.status !== "closed")
    .sort(byRecent);

  return (
    <View style={styles.mt8}>
      <View style={view(styles.flexRow, styles.itemsCenter, styles.justifyBetween)}>
        <AppText variant="title">{t("features.tradeLog.home.title")}</AppText>
        {active.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push("/trade-log")}
          >
            <AppText variant="label" color="primary">
              {t("features.tradeLog.action.seeAll")}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.mt2}>
        <OpenRiskNote />
      </View>

      {active.length === 0 ? (
        <View style={view(styles.mt2, styles.gap4)}>
          <AppText color="muted">{t("features.tradeLog.home.empty")}</AppText>
          <Button
            variant="secondary"
            title={t("features.tradeLog.action.create")}
            onPress={() => router.push("/plan/new")}
            style={styles.selfStart}
          />
        </View>
      ) : (
        active.slice(0, PREVIEW_COUNT).map((plan) => (
          <PlanRow
            key={plan.id}
            plan={plan}
            onPress={() =>
              router.push({ pathname: "/plan/[id]", params: { id: plan.id } })
            }
          />
        ))
      )}
    </View>
  );
}
