import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { fetchProductById } from "@/features/example/services/api";
import {
  Alert,
  AppText,
  Badge,
  BottomSheet,
  Button,
  Card,
  Divider,
  EmptyState,
  ListItem,
  Screen,
  Skeleton,
  Tabs,
  useToast,
} from "@/shared/components";
import { formatCurrency, formatDate, formatPercent } from "@/shared/helpers";
import type { ApiError } from "@/shared/models";
import { useStyles, view } from "@/styles";
import { radii, spacing } from "@/styles/tokens";

type DetailTab = "overview" | "specs" | "reviews";

const HERO_HEIGHT = spacing[64];

export default function ProductDetailScreen() {
  const styles = useStyles();
  const toast = useToast();
  const { t } = useTranslation();

  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);

  const [tab, setTab] = useState<DetailTab>("overview");
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: product, error, isPending, refetch } = useQuery({
    queryKey: ["example", "product", productId],
    queryFn: () => fetchProductById(productId),
    // A non-numeric param means a hand-typed URL; do not call the API with NaN.
    enabled: Number.isFinite(productId),
  });

  const apiError = error as ApiError | null;

  if (!Number.isFinite(productId)) {
    return (
      <Screen>
        <EmptyState title={t("features.example.products.detail.notFound")} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: product?.title ?? t("utils.state.loading") }} />
      <Screen contentContainerStyle={styles.gap4}>
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
          <View style={view(styles.gap4)}>
            <Skeleton width="100%" height={HERO_HEIGHT} radius={radii["2xl"]} />
            <Skeleton width="70%" height={22} />
            <Skeleton.Text lines={4} />
          </View>
        ) : null}

        {product ? (
          <>
            <Image
              source={product.thumbnail}
              style={{
                width: "100%",
                height: HERO_HEIGHT,
                borderRadius: radii["2xl"],
              }}
              contentFit="cover"
              transition={200}
              accessibilityIgnoresInvertColors
            />

            <View style={view(styles.gap2)}>
              <AppText variant="h2">{product.title}</AppText>
              <View style={view(styles.flexRow, styles.itemsCenter, styles.gap2)}>
                <AppText variant="h3" color="primary">
                  {formatCurrency(product.price, { currency: "USD" })}
                </AppText>
                {product.discountPercentage > 0 ? (
                  <Badge
                    label={formatPercent(product.discountPercentage / 100)}
                    variant="success"
                    size="sm"
                  />
                ) : null}
              </View>
            </View>

            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: "overview", label: t("features.example.products.detail.tab.overview") },
                { value: "specs", label: t("features.example.products.detail.tab.specs") },
                { value: "reviews", label: t("features.example.products.detail.tab.reviews") },
              ]}
            />

            {tab === "overview" ? (
              <Card variant="outlined">
                <AppText color="muted">{product.description}</AppText>
              </Card>
            ) : null}

            {tab === "specs" ? (
              <Card variant="outlined" padded={false}>
                <ListItem
                  title={t("features.example.products.detail.brand")}
                  right={<AppText variant="label">{product.brand ?? "-"}</AppText>}
                />
                <Divider />
                <ListItem
                  title={t("features.example.products.detail.category")}
                  right={<AppText variant="label">{product.category}</AppText>}
                />
                <Divider />
                <ListItem
                  title={t("features.example.products.detail.rating")}
                  right={<AppText variant="label">{product.rating.toFixed(1)}</AppText>}
                />
                <Divider />
                <ListItem
                  title={t("features.example.products.detail.stock")}
                  right={<AppText variant="label">{product.stock}</AppText>}
                />
              </Card>
            ) : null}

            {tab === "reviews" ? (
              <Card variant="outlined">
                {product.reviews && product.reviews.length > 0 ? (
                  <View style={view(styles.gap4)}>
                    {product.reviews.map((review, index) => (
                      <View key={`${review.reviewerEmail}-${index}`} style={view(styles.gap2)}>
                        {index > 0 ? <Divider /> : null}
                        <View style={view(styles.flexRow, styles.justifyBetween, styles.gap2)}>
                          <AppText variant="label">{review.reviewerName}</AppText>
                          <Badge label={`${review.rating}/5`} size="sm" variant="outline" />
                        </View>
                        <AppText variant="caption" color="muted">
                          {review.comment}
                        </AppText>
                        <AppText variant="caption" color="muted">
                          {formatDate(review.date)}
                        </AppText>
                      </View>
                    ))}
                  </View>
                ) : (
                  <EmptyState title={t("features.example.products.detail.noReviews")} />
                )}
              </Card>
            ) : null}

            <Button
              title={t("features.example.products.detail.action")}
              size="lg"
              block
              disabled={product.stock === 0}
              onPress={() => setSheetOpen(true)}
            />
          </>
        ) : null}
      </Screen>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t("features.example.products.detail.sheetTitle")}
      >
        <View style={view(styles.gap3, styles.pb4)}>
          <AppText color="muted">{product?.title}</AppText>
          <Button
            title={t("features.example.products.detail.confirm")}
            block
            onPress={() => {
              setSheetOpen(false);
              toast.success(t("features.example.products.detail.added"));
            }}
          />
        </View>
      </BottomSheet>
    </>
  );
}
