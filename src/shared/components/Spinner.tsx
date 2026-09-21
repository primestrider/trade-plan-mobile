import { ActivityIndicator, View, type ViewProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { spacing, type ThemeColors } from "@/styles/tokens";

import { AppText } from "./AppText";

type SpinnerSize = "sm" | "md" | "lg";

type SpinnerVariant = "primary" | "muted" | "inverse";

export type SpinnerProps = ViewProps & {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  /** Fills its parent with a scrim and centers the spinner. */
  overlay?: boolean;
};

/**
 * Busy indicator, optionally over a scrim that blocks the content behind it.
 *
 * `ActivityIndicator` only offers two platform sizes, so `sm` and `md` share
 * the small one and differ in the gap under the label — a third glyph size
 * would have to be faked with a transform, which blurs the stroke.
 *
 * @example
 * <Spinner />
 * <Spinner size="lg" label="Uploading…" />
 * <Spinner overlay label="Signing in" />
 */
export function Spinner({
  size = "md",
  variant = "primary",
  label,
  overlay = false,
  style,
  accessibilityLabel,
  ...rest
}: Readonly<SpinnerProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant, colors);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? label ?? "Loading"}
      style={[
        view(
          styles.center,
          { gap: sizeStyles.gap },
          overlay && styles.absolute,
          overlay && styles.inset0,
          // `CC` is 80% alpha on the theme background, so the scrim hides the
          // content behind it in either scheme instead of a fixed black wash.
          overlay && { backgroundColor: `${colors.background}CC` },
        ),
        style,
      ]}
      {...rest}
    >
      <ActivityIndicator
        size={sizeStyles.indicator}
        color={variantStyles.color}
      />

      {label ? (
        <AppText variant="caption" color="muted">
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

function getVariantStyles(variant: SpinnerVariant, colors: ThemeColors) {
  switch (variant) {
    case "primary":
      return { color: colors.primary };

    case "muted":
      return { color: colors.mutedForeground };

    // Reads on a filled primary surface, where `primary` would vanish.
    case "inverse":
      return { color: colors.primaryForeground };
  }
}

function getSizeStyles(size: SpinnerSize) {
  switch (size) {
    case "sm":
      return { indicator: "small" as const, gap: spacing[1] };

    case "md":
      return { indicator: "small" as const, gap: spacing[2] };

    case "lg":
      return { indicator: "large" as const, gap: spacing[3] };
  }
}
