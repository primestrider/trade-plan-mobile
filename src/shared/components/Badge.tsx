import { View, type ViewProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { palette, spacing, type ThemeColors } from "@/styles/tokens";

import { AppText } from "./AppText";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "outline";

type BadgeSize = "sm" | "md";

export type BadgeProps = ViewProps & {
  label?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
};

/**
 * Small static status label — counts, states, tags.
 *
 * Deliberately not pressable: an interactive pill is `Chip`, and keeping the
 * two apart stops a decorative badge from picking up a button's a11y role.
 *
 * @example
 * <Badge label="New" variant="primary" />
 * <Badge variant="outline" size="sm">3 open</Badge>
 */
export function Badge({
  label,
  variant = "default",
  size = "md",
  style,
  children,
  ...rest
}: Readonly<BadgeProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const variantStyles = getVariantStyles(variant, colors);
  const sizeStyles = getSizeStyles(size);

  const content = children ?? label;

  return (
    <View
      style={[
        view(styles.rowCenter, styles.selfStart, styles.roundedFull, {
          backgroundColor: variantStyles.bg,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.border,
          paddingHorizontal: sizeStyles.px,
          paddingVertical: sizeStyles.py,
        }),
        style,
      ]}
      {...rest}
    >
      {/* A bare string child would crash inside a View, so text is adopted into
          `AppText` while element children are passed through untouched. */}
      {typeof content === "string" || typeof content === "number" ? (
        <AppText
          variant={sizeStyles.textVariant}
          style={{ color: variantStyles.text }}
        >
          {content}
        </AppText>
      ) : (
        content
      )}
    </View>
  );
}

function getVariantStyles(variant: BadgeVariant, colors: ThemeColors) {
  switch (variant) {
    case "default":
      return {
        bg: colors.secondary,
        text: colors.secondaryForeground,
        border: palette.transparent,
        borderWidth: 0,
      };

    case "primary":
      return {
        bg: colors.primary,
        text: colors.primaryForeground,
        border: palette.transparent,
        borderWidth: 0,
      };

    // `success`/`warning`/`info` are the same hue in both themes, so their ink
    // is pinned rather than themed — a themed foreground would invert in dark
    // mode and lose contrast against a fill that never moved.
    case "success":
      return {
        bg: colors.success,
        text: palette.white,
        border: palette.transparent,
        borderWidth: 0,
      };

    case "warning":
      return {
        bg: colors.warning,
        // Amber is too light for white ink; near-black is the readable pair.
        text: palette.gray[950],
        border: palette.transparent,
        borderWidth: 0,
      };

    case "destructive":
      return {
        bg: colors.destructive,
        text: colors.destructiveForeground,
        border: palette.transparent,
        borderWidth: 0,
      };

    case "info":
      return {
        bg: colors.info,
        text: palette.white,
        border: palette.transparent,
        borderWidth: 0,
      };

    case "outline":
      return {
        bg: palette.transparent,
        text: colors.foreground,
        border: colors.border,
        borderWidth: 1,
      };
  }
}

function getSizeStyles(size: BadgeSize) {
  switch (size) {
    case "sm":
      return {
        px: spacing[2],
        py: spacing[0.5],
        textVariant: "caption" as const,
      };

    case "md":
      return {
        px: spacing[2.5],
        py: spacing[1],
        textVariant: "label" as const,
      };
  }
}
