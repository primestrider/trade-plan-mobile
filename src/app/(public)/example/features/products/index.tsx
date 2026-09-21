import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";

import { ProductCard } from "@/features/example/components";
import type { DummyProductListResponse } from "@/features/example/models/api.model";
import { examplePaths } from "@/features/example/routes";
import { fetchProducts, searchProducts } from "@/features/example/services/api";
import {
  Alert,
  AppText,
  Button,
  Card,
  EmptyState,
  Input,
  Screen,
  Skeleton,
  Spinner,
} from "@/shared/components";
import type { ApiError } from "@/shared/models";
import { useStyles, useTheme, view } from "@/styles";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE = 350;

export default function ProductsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), SEARCH_DEBOUNCE);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    error,
    isPending,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["example", "products", query],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      query
        ? searchProducts({ query, limit: PAGE_SIZE, skip: pageParam })
        : fetchProducts({ limit: PAGE_SIZE, skip: pageParam }),
    getNextPageParam: (lastPage: DummyProductListResponse) => {
      const loaded = lastPage.skip + lastPage.products.length;
      // Returning undefined is how React Query is told there is no next page.
      return loaded < lastPage.total ? loaded : undefined;
    },
  });

  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const apiError = error as ApiError | null;

  return (
    <>
      <Stack.Screen options={{ title: t("features.example.products.title") }} />
      <Screen scroll={false} contentContainerStyle={styles.gap4}>
        <View>
          <AppText variant="h2">{t("features.example.products.title")}</AppText>
          <AppText variant="caption" color="muted" style={styles.mt1}>
            {t("features.example.products.subtitle")}
          </AppText>
        </View>

        <Input
          placeholder={t("features.example.products.search.placeholder")}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        {apiError ? (
          <Alert
            variant="error"
            title={t("features.example.products.error.title")}
            description={
              apiError.isNetworkError ? t("utils.error.network") : apiError.message
            }
            action={
              <Button
                title={t("utils.action.retry")}
                variant="outline"
                size="sm"
                onPress={() => refetch()}
              />
            }
          />
        ) : null}

        {isPending && !apiError ? (
          <View style={view(styles.gap3)}>
            {[0, 1, 2, 3, 4].map((row) => (
              <Card key={row} variant="outlined">
                <View style={view(styles.flexRow, styles.gap3)}>
                  <Skeleton width={80} height={80} radius={16} />
                  <View style={view(styles.flex1, styles.gap2)}>
                    <Skeleton width="80%" height={14} />
                    <Skeleton width="40%" height={12} />
                    <Skeleton width="55%" height={18} />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View style={view(styles.flex1)}>
            <FlashList
              data={products}
              keyExtractor={(product) => String(product.id)}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => router.push(examplePaths.productDetail(item.id))}
                />
              )}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
              }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  tintColor={colors.primary}
                />
              }
              ListEmptyComponent={
                apiError ? null : (
                  <Card variant="outlined">
                    <EmptyState
                      title={t("features.example.products.empty.title")}
                      description={t("features.example.products.empty.description")}
                    />
                  </Card>
                )
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View style={view(styles.py4)}>
                    <Spinner />
                  </View>
                ) : null
              }
            />
          </View>
        )}
      </Screen>
    </>
  );
}
