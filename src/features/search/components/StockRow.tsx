import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { AppText } from "@/shared/components";
import { useStyles, useTheme, view } from "@/styles";

import { changeTone, formatChange, formatPrice } from "../helpers/stock";
import type { Stock } from "../models/api.model";

export type StockRowProps = {
  stock: Stock;
  onPress: (stock: Stock) => void;
};

/**
 * One line of the result list: code and company on the left, where the price
 * stands today on the right — enough to tell BBCA from BBCP without opening
 * either.
 */
export const StockRow = memo(function StockRow({
  stock,
  onPress,
}: Readonly<StockRowProps>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => onPress(stock)}
      accessibilityRole="button"
      accessibilityLabel={`${stock.Code}, ${stock.Name}, ${formatPrice(
        stock.Last,
      )}, ${formatChange(stock.OneDay)}`}
      accessibilityHint={t("features.search.rowHint")}
      style={({ pressed }) =>
        view(
          styles.flexRow,
          styles.itemsCenter,
          styles.gap3,
          styles.px4,
          styles.py3,
          styles.borderB,
          styles.borderBorder,
          pressed && { backgroundColor: colors.secondary },
        )
      }
    >
      <View style={styles.flex1}>
        <AppText variant="title" weight="extrabold">
          {stock.Code}
        </AppText>
        <AppText variant="caption" color="muted" numberOfLines={1}>
          {stock.Name}
        </AppText>
      </View>

      <View style={styles.itemsEnd}>
        <AppText weight="semibold" style={{ fontVariant: ["tabular-nums"] }}>
          {formatPrice(stock.Last)}
        </AppText>
        <AppText
          variant="caption"
          weight="medium"
          color={changeTone(stock.OneDay)}
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {formatChange(stock.OneDay)}
        </AppText>
      </View>
    </Pressable>
  );
});
