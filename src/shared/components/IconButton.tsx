import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { palette, spacing, type ThemeColors } from "@/styles/tokens";

type IconButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonProps = PressableProps & {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  /** Required — an icon-only control has no visible label. */
  accessibilityLabel: string;
};

/**
 * Square, fully-rounded control holding a single icon.
 *
 * Mirrors `Button`'s variants and its disabled/loading/pressed opacities, so
 * an icon button sitting next to a text button reacts identically.
 *
 * `accessibilityLabel` is required rather than optional: there is no text to
 * fall back on, so an unlabelled one is announced as "button" and nothing else.
 *
 * @example
 * <IconButton icon={<Chevron />} accessibilityLabel="Go back" variant="ghost" />
 * <IconButton icon={<Trash />} accessibilityLabel="Delete" variant="destructive" loading />
 */
export function IconButton({
  icon,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  ...rest
}: Readonly<IconButtonProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant, colors);
  const sizeStyles = getSizeStyles(size);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={(state) => [
        view(
          styles.itemsCenter,
          styles.justifyCenter,
          styles.roundedFull,
          {
            width: sizeStyles.box,
            height: sizeStyles.box,
            backgroundColor: variantStyles.bg,
            opacity: isDisabled ? 0.5 : state.pressed ? 0.7 : 1,
          },
        ),
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size={sizeStyles.indicator}
          color={variantStyles.icon}
        />
      ) : (
        icon
      )}
    </Pressable>
  );
}

function getVariantStyles(variant: IconButtonVariant, colors: ThemeColors) {
  switch (variant) {
    case "primary":
      return { bg: colors.primary, icon: colors.primaryForeground };

    case "secondary":
      return { bg: colors.secondary, icon: colors.secondaryForeground };

    case "ghost":
      return { bg: palette.transparent, icon: colors.primary };

    case "destructive":
      return { bg: colors.destructive, icon: colors.destructiveForeground };
  }
}

function getSizeStyles(size: IconButtonSize) {
  switch (size) {
    case "sm":
      return { box: spacing[8], indicator: "small" as const };

    case "md":
      return { box: spacing[10], indicator: "small" as const };

    case "lg":
      return { box: spacing[12], indicator: "large" as const };
  }
}
