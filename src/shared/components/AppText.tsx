import { Text, type TextProps } from "react-native";

import { text, useStyles, useTheme, type ThemedUtilities } from "@/styles";
import type { ThemeColors } from "@/styles/tokens";

type AppTextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "body"
  | "label"
  | "caption"
  | "mono";

type AppTextColor =
  | "foreground"
  | "muted"
  | "primary"
  | "secondary"
  | "destructive"
  | "success"
  | "warning"
  | "inverse";

type AppTextWeight =
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "mono";

type AppTextAlign = "left" | "center" | "right";

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: AppTextColor;
  /** Overrides the weight the variant would otherwise pick. */
  weight?: AppTextWeight;
  align?: AppTextAlign;
};

/**
 * Themed text.
 *
 * Named `AppText` rather than `Text` so it never shadows React Native's own
 * export — a shadowed `Text` is easy to import by accident and the mistake is
 * invisible until it renders unstyled.
 *
 * Picking a `variant` sets size and weight together, so headings stay
 * consistent across screens instead of being reassembled by hand each time.
 *
 * @example
 * <AppText variant="h2">Settings</AppText>
 * <AppText variant="caption" color="muted">Last synced 2m ago</AppText>
 */
export function AppText({
  variant = "body",
  color = "foreground",
  weight,
  align,
  style,
  ...rest
}: Readonly<AppTextProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const variantStyles = getVariantStyles(variant, styles);

  return (
    <Text
      style={[
        text(
          variantStyles.size,
          weight ? getWeightStyle(weight, styles) : variantStyles.weight,
          variantStyles.tracking,
          getColorStyle(color, styles, colors),
          align && getAlignStyle(align, styles),
        ),
        style,
      ]}
      {...rest}
    />
  );
}

function getVariantStyles(variant: AppTextVariant, styles: ThemedUtilities) {
  switch (variant) {
    case "h1":
      return {
        size: styles.text3xl,
        weight: styles.fontExtraBold,
        tracking: styles.trackingTight,
      };

    case "h2":
      return {
        size: styles.text2xl,
        weight: styles.fontBold,
        tracking: styles.trackingTight,
      };

    case "h3":
      return {
        size: styles.textXl,
        weight: styles.fontSemiBold,
        tracking: undefined,
      };

    case "title":
      return {
        size: styles.textLg,
        weight: styles.fontSemiBold,
        tracking: undefined,
      };

    case "body":
      return {
        size: styles.textBase,
        weight: styles.fontNormal,
        tracking: undefined,
      };

    case "label":
      return {
        size: styles.textSm,
        weight: styles.fontMedium,
        tracking: undefined,
      };

    case "caption":
      return {
        size: styles.textXs,
        weight: styles.fontNormal,
        tracking: undefined,
      };

    case "mono":
      return {
        size: styles.textSm,
        weight: styles.fontMono,
        tracking: undefined,
      };
  }
}

function getWeightStyle(weight: AppTextWeight, styles: ThemedUtilities) {
  switch (weight) {
    case "normal":
      return styles.fontNormal;
    case "medium":
      return styles.fontMedium;
    case "semibold":
      return styles.fontSemiBold;
    case "bold":
      return styles.fontBold;
    case "extrabold":
      return styles.fontExtraBold;
    case "mono":
      return styles.fontMono;
  }
}

function getColorStyle(
  color: AppTextColor,
  styles: ThemedUtilities,
  colors: ThemeColors,
) {
  switch (color) {
    case "foreground":
      return styles.textForeground;
    case "muted":
      return styles.textMuted;
    case "primary":
      return styles.textPrimary;
    case "secondary":
      return styles.textSecondary;
    case "destructive":
      return styles.textDestructive;
    case "success":
      return styles.textSuccess;
    case "warning":
      return styles.textWarning;
    // Reads on a filled primary surface, where `foreground` would vanish.
    case "inverse":
      return { color: colors.primaryForeground };
  }
}

function getAlignStyle(align: AppTextAlign, styles: ThemedUtilities) {
  switch (align) {
    case "left":
      return styles.textLeft;
    case "center":
      return styles.textCenter;
    case "right":
      return styles.textRight;
  }
}
