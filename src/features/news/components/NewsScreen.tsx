import { Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl, View } from "react-native";

import { usePlanStore } from "@/features/trade-log/stores/plan.store";
import {
  AppText,
  Button,
  Chip,
  EmptyState,
  Skeleton,
} from "@/shared/components";
import { useStyles, view } from "@/styles";
import { spacing } from "@/styles/tokens";

import { useNews } from "../hooks/useNews";
import { NEWS_FEEDS } from "../services/api";
import { NewsRow } from "./NewsRow";

/**
 * Every recent market headline, newest first. The filter narrows it to the
 * stocks in the user's live plans, which is the news that can change a plan.
 */
export function NewsScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const { items, isPending, isError, refetch, isRefetching } = useNews();
  const plans = usePlanStore((state) => state.plans);
  const [onlyPlans, setOnlyPlans] = useState(false);

  const planCodes = new Set(
    plans.filter((plan) => plan.status !== "closed").map((plan) => plan.code),
  );
  const shown = onlyPlans ? items.filter((item) => item.aboutPlans) : items;

  const renderEmpty = () => {
    if (isPending) {
      return (
        <View style={view(styles.gap4, styles.mt4)}>
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} height={72} />
          ))}
        </View>
      );
    }

    if (isError) {
      return (
        <EmptyState
          style={styles.mt8}
          title={t("features.news.error.title")}
          description={t("features.news.error.description")}
          action={
            <Button
              variant="secondary"
              title={t("utils.action.retry")}
              onPress={() => refetch()}
            />
          }
        />
      );
    }

    return (
      <EmptyState
        style={styles.mt8}
        title={t("features.news.empty.title")}
        description={
          onlyPlans
            ? t("features.news.empty.plans")
            : t("features.news.empty.description")
        }
      />
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t("features.news.title") }} />

      <FlatList
        data={shown}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NewsRow item={item} planCodes={planCodes} />}
        contentContainerStyle={{
          paddingHorizontal: spacing[4],
          paddingBottom: spacing[8],
        }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        ListHeaderComponent={
          planCodes.size > 0 ? (
            <View style={view(styles.flexRow, styles.gap2, styles.pt4)}>
              <Chip
                size="sm"
                label={t("features.news.filter.all")}
                selected={!onlyPlans}
                onPress={() => setOnlyPlans(false)}
              />
              <Chip
                size="sm"
                label={t("features.news.filter.plans")}
                selected={onlyPlans}
                onPress={() => setOnlyPlans(true)}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={
          shown.length > 0 ? (
            <AppText variant="caption" color="muted" style={{ marginTop: spacing[4] }}>
              {t("features.news.sources", {
                sources: NEWS_FEEDS.map((feed) => feed.source).join(", "),
              })}
            </AppText>
          ) : null
        }
      />
    </>
  );
}
