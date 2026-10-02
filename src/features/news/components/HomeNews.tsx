import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { usePlanStore } from "@/features/trade-log/stores/plan.store";
import { AppText, Skeleton } from "@/shared/components";
import { useStyles, view } from "@/styles";

import { useNews } from "../hooks/useNews";
import { NewsRow } from "./NewsRow";

/** How many headlines the home screen shows before "See all". */
const PREVIEW_COUNT = 3;

/**
 * A short read of the market on home. Headlines that name a stock in a live
 * plan go first, whatever their age; the rest follow newest first.
 */
export function HomeNews() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { items, isPending, isError, refetch } = useNews();
  const plans = usePlanStore((state) => state.plans);

  const planCodes = new Set(
    plans.filter((plan) => plan.status !== "closed").map((plan) => plan.code),
  );
  const preview = [
    ...items.filter((item) => item.aboutPlans),
    ...items.filter((item) => !item.aboutPlans),
  ].slice(0, PREVIEW_COUNT);

  const renderBody = () => {
    if (isPending) {
      return (
        <View style={view(styles.gap4, styles.mt4)}>
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} height={72} />
          ))}
        </View>
      );
    }

    if (isError) {
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => refetch()}
          style={view(styles.flexRow, styles.gap2, styles.mt2)}
        >
          <AppText color="muted">{t("features.news.error.short")}</AppText>
          <AppText variant="label" color="primary">
            {t("utils.action.retry")}
          </AppText>
        </Pressable>
      );
    }

    if (preview.length === 0) {
      return (
        <AppText color="muted" style={styles.mt2}>
          {t("features.news.empty.title")}
        </AppText>
      );
    }

    return preview.map((item) => (
      <NewsRow key={item.id} item={item} planCodes={planCodes} />
    ));
  };

  return (
    <View style={styles.mt8}>
      <View style={view(styles.flexRow, styles.itemsCenter, styles.justifyBetween)}>
        <AppText variant="title">{t("features.news.title")}</AppText>
        {preview.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push("/news")}
          >
            <AppText variant="label" color="primary">
              {t("features.news.seeAll")}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {renderBody()}
    </View>
  );
}
