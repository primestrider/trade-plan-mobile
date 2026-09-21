import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AppText, Badge, Card } from "@/shared/components";
import { formatCurrency } from "@/shared/helpers";
import { useStyles, view } from "@/styles";
import { radii, spacing } from "@/styles/tokens";

import type { DummyProduct } from "../models/api.model";

const THUMBNAIL = spacing[20];

export type ProductCardProps = {
  product: DummyProduct;
  onPress: () => void;
};

/**
 * One row in the product list.
 *
 * Prices are shown in USD because that is the currency DummyJSON quotes — the
 * formatter defaults to IDR, so passing it explicitly keeps the label honest
 * rather than relabelling dollars as rupiah.
 */
export function ProductCard({ product, onPress }: Readonly<ProductCardProps>) {
  const styles = useStyles();
  const { t } = useTranslation();

  const inStock = product.stock > 0;

  return (
    <Card variant="outlined" onPress={onPress} style={styles.mb3}>
      <View style={view(styles.flexRow, styles.gap3)}>
        <Image
          source={product.thumbnail}
          style={{
            width: THUMBNAIL,
            height: THUMBNAIL,
            borderRadius: radii.xl,
          }}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />

        {/* `minWidth: 0` lets the title truncate instead of pushing the row wide. */}
        <View style={view(styles.flex1, styles.gap1, { minWidth: 0 })}>
          <AppText variant="label" numberOfLines={2}>
            {product.title}
          </AppText>

          <View style={view(styles.flexRow)}>
            <Badge label={product.category} size="sm" variant="outline" />
          </View>

          <View style={view(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mt1)}>
            <AppText variant="title" color="primary">
              {formatCurrency(product.price, { currency: "USD" })}
            </AppText>

            <AppText variant="caption" color={inStock ? "muted" : "destructive"}>
              {inStock
                ? t("features.example.products.stock", { count: product.stock })
                : t("features.example.products.outOfStock")}
            </AppText>
          </View>
        </View>
      </View>
    </Card>
  );
}
