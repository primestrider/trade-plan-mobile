import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppText,
  Button,
  EmptyState,
  Input,
  Skeleton,
} from "@/shared/components";
import type { ApiError } from "@/shared/models";
import { useStyles, useTheme, view } from "@/styles";
import { spacing } from "@/styles/tokens";

import { filterStocks } from "../helpers/stock";
import type { Stock } from "../models/api.model";
import { fetchStocks } from "../services/api";

import { StockRow } from "./StockRow";

/**
 * Stock search, the middle tab of the bottom menu. The tab has no header, so
 * the screen draws its own title and claims the top inset.
 *
 * The whole exchange is loaded once and filtered on the device, so results
 * follow each keystroke with no request in between. With nothing typed the
 * list is simply every stock A–Z, which doubles as a way to browse.
 */
export function SearchScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");

  /**
   * Every listed stock, namespaced so other screens reading the same list
   * share this cache instead of fetching ~1 MB again.
   */
  const {
    data: stocks,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useQuery<Stock[], ApiError>({
    queryKey: ["stocks", "list"],
    queryFn: fetchStocks,
  });

  // Typing stays responsive while the ~1,000-row filter catches up.
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(
    () => filterStocks(stocks ?? [], deferredQuery),
    [stocks, deferredQuery],
  );

  const openStock = useCallback(
    (stock: Stock) =>
      router.push({ pathname: "/stock/[code]", params: { code: stock.Code } }),
    [router],
  );

  const renderBody = () => {
    if (isPending) return <LoadingRows label={t("features.search.loading")} />;

    if (isError) {
      return (
        <EmptyState
          title={t("features.search.error.title")}
          description={t("features.search.error.description")}
          action={
            <Button
              title={t("utils.action.retry")}
              variant="secondary"
              onPress={() => refetch()}
            />
          }
        />
      );
    }

    return (
      <FlashList
        data={results}
        keyExtractor={(stock) => stock.Code}
        renderItem={({ item }) => <StockRow stock={item} onPress={openStock} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={isRefetching}
        onRefresh={refetch}
        // The native tab bar already keeps the list clear of the bottom inset.
        contentContainerStyle={{ paddingBottom: spacing[6] }}
        ListEmptyComponent={
          <EmptyState
            title={t("features.search.noMatch.title", {
              query: deferredQuery.trim(),
            })}
            description={t("features.search.noMatch.description")}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={view(styles.flex1, styles.bgBackground)}
    >
      <View style={styles.flex1}>
        <View style={view(styles.px4, styles.pt4, styles.pb2, styles.gap4)}>
          <AppText variant="h3">{t("features.search.title")}</AppText>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder={t("features.search.placeholder")}
            accessibilityLabel={t("features.search.title")}
            autoCorrect={false}
            autoCapitalize="characters"
            returnKeyType="search"
            leftIcon={
              <SymbolView
                name={{
                  ios: "magnifyingglass",
                  android: "search",
                  web: "search",
                }}
                tintColor={colors.muted}
                size={18}
              />
            }
            rightIcon={
              query ? (
                <Pressable
                  onPress={() => setQuery("")}
                  accessibilityRole="button"
                  accessibilityLabel={t("utils.action.clear")}
                  hitSlop={spacing[2]}
                >
                  <SymbolView
                    name={{
                      ios: "xmark.circle.fill",
                      android: "cancel",
                      web: "cancel",
                    }}
                    tintColor={colors.mutedForeground}
                    size={18}
                  />
                </Pressable>
              ) : null
            }
          />
        </View>

        <View style={styles.flex1}>{renderBody()}</View>
      </View>
    </SafeAreaView>
  );
}

/** Stand-in rows shaped like `StockRow`, so the list does not jump in. */
function LoadingRows({ label }: Readonly<{ label: string }>) {
  const styles = useStyles();

  return (
    <View accessible accessibilityLabel={label}>
      {Array.from({ length: 8 }, (_, index) => (
        <View
          key={index}
          style={view(
            styles.flexRow,
            styles.itemsCenter,
            styles.justifyBetween,
            styles.px4,
            styles.py3,
          )}
        >
          <View style={styles.gap1}>
            <Skeleton width={56} height={18} />
            <Skeleton width={160} height={12} />
          </View>
          <View style={view(styles.itemsEnd, styles.gap1)}>
            <Skeleton width={56} height={16} />
            <Skeleton width={40} height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}
