import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

import { text, useStyles, useTheme, view } from "@/styles";
import { fontSize, palette, spacing, type ThemeColors } from "@/styles/tokens";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = PressableProps & {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  block = false,
  style: externalStyle,
  children: childrenProp,
  ...rest
}: ButtonProps) {
  const children = childrenProp as ReactNode;
  const styles = useStyles();
  const { colors } = useTheme();

  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant, colors);
  const sizeStyles = getSizeStyles(size);

  return (
    <Pressable
      disabled={isDisabled}
      style={(state) => [
        view(
          styles.flexRow,
          styles.itemsCenter,
          styles.justifyCenter,
          styles.roundedFull,
          block && styles.wFull,
          {
            opacity: isDisabled ? 0.5 : state.pressed ? 0.7 : 1,
            backgroundColor: variantStyles.bg,
            borderWidth: variant === "outline" ? 1.5 : 0,
            borderColor: variantStyles.border,
            paddingVertical: sizeStyles.py,
            paddingHorizontal: sizeStyles.px,
            gap: sizeStyles.gap,
          },
        ),
        typeof externalStyle === "function"
          ? externalStyle(state)
          : externalStyle,
      ]}
      {...rest}
    >
      {loading && (
        <ActivityIndicator
          size={sizeStyles.indicator}
          color={variantStyles.text}
        />
      )}

      {title && (
        <Text
          style={text({
            color: variantStyles.text,
            fontSize: sizeStyles.fontSize,
            fontFamily: sizeStyles.fontFamily,
          })}
        >
          {title}
        </Text>
      )}

      {children}
    </Pressable>
  );
}

function getVariantStyles(variant: ButtonVariant, colors: ThemeColors) {
  switch (variant) {
    case "primary":
      return {
        bg: colors.primary,
        text: colors.primaryForeground,
        border: palette.transparent,
      };

    case "secondary":
      return {
        bg: colors.secondary,
        text: colors.secondaryForeground,
        border: palette.transparent,
      };

    case "outline":
      return {
        bg: palette.transparent,
        text: colors.primary,
        border: colors.border,
      };

    case "ghost":
      return {
        bg: palette.transparent,
        text: colors.primary,
        border: palette.transparent,
      };

    case "destructive":
      return {
        bg: colors.destructive,
        text: colors.destructiveForeground,
        border: palette.transparent,
      };
  }
}

function getSizeStyles(size: ButtonSize) {
  switch (size) {
    case "sm":
      return {
        py: spacing[2],
        px: spacing[3],
        fontSize: fontSize.sm,
        fontFamily: "PlusJakartaSans-Medium",
        indicator: "small" as const,
        gap: spacing[1.5],
      };

    case "md":
      return {
        py: spacing[3],
        px: spacing[5],
        fontSize: fontSize.base,
        fontFamily: "PlusJakartaSans-SemiBold",
        indicator: "small" as const,
        gap: spacing[2],
      };

    case "lg":
      return {
        py: spacing[4],
        px: spacing[7],
        fontSize: fontSize.lg,
        fontFamily: "PlusJakartaSans-SemiBold",
        indicator: "large" as const,
        gap: spacing[2.5],
      };
  }
}
