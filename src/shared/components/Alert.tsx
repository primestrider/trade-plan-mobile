import type { ReactNode } from "react";
import { Pressable, View, type ViewProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { radii, spacing, type ThemeColors } from "@/styles/tokens";

import { AppText } from "./AppText";

/** Hex alpha suffixes — the same tinting trick `Input` uses for its focus glow. */
const TINT_BG = "1A"; // ~10%
const TINT_BORDER = "40"; // ~25%

type AlertVariant = "info" | "success" | "warning" | "error";

export type AlertProps = ViewProps & {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
  /** Renders a dismiss affordance. */
  onClose?: () => void;
};

/**
 * Inline banner for a message tied to the content around it, rather than to a
 * moment in time — use `Toast` for the latter.
 *
 * The variant is carried by the tint, border, and accent bar, while the text
 * stays on `foreground`/`muted`. A semantic color light enough to read as a
 * tint is too light to read as body text, and that contrast has to hold in
 * both schemes.
 *
 * @example
 * <Alert variant="success" title="Saved" description="Your changes are live." />
 */
export function Alert({
  variant = "info",
  title,
  description,
  action,
  onClose,
  style,
  children,
  ...rest
}: Readonly<AlertProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const tint = getVariantColor(variant, colors);

  return (
    <View
      accessibilityRole="alert"
      style={[
        view(styles.flexRow, styles.rounded2xl, styles.p4, styles.gap3, {
          backgroundColor: `${tint}${TINT_BG}`,
          borderWidth: 1,
          borderColor: `${tint}${TINT_BORDER}`,
        }),
        style,
      ]}
      {...rest}
    >
      <View
        testID="alert-accent"
        style={view({
          width: spacing[1],
          borderRadius: radii.full,
          backgroundColor: tint,
        })}
      />

      <View style={view(styles.flex1, styles.gap1)}>
        {title ? (
          <AppText variant="label" weight="semibold">
            {title}
          </AppText>
        ) : null}
        {description ? (
          <AppText variant="caption" color="muted">
            {description}
          </AppText>
        ) : null}
        {children}
        {action ? <View style={view(styles.mt2)}>{action}</View> : null}
      </View>

      {onClose ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
          hitSlop={spacing[2]}
          style={({ pressed }) => view(pressed && styles.opacity50)}
        >
          <AppText variant="body" color="muted">
            ×
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

function getVariantColor(variant: AlertVariant, colors: ThemeColors) {
  switch (variant) {
    case "info":
      return colors.info;
    case "success":
      return colors.success;
    case "warning":
      return colors.warning;
    case "error":
      return colors.destructive;
  }
}
