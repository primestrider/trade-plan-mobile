import { Pressable, View, type PressableProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { palette, spacing, type ThemeColors } from "@/styles/tokens";

import { AppText } from "./AppText";

type ChipSize = "sm" | "md";

export type ChipProps = PressableProps & {
  label: string;
  selected?: boolean;
  size?: ChipSize;
  /** Adds a trailing dismiss affordance; omit it for a plain toggle chip. */
  onRemove?: () => void;
};

/**
 * Interactive sibling of `Badge` — filter chips and selectable tags.
 *
 * `selected` drives colour rather than a separate `variant`, because a chip's
 * only meaningful visual state is whether it is on.
 *
 * @example
 * <Chip label="Unread" selected onPress={toggle} />
 * <Chip label="React Native" onRemove={() => remove("rn")} />
 */
export function Chip({
  label,
  selected = false,
  size = "md",
  onRemove,
  disabled = false,
  style: externalStyle,
  ...rest
}: Readonly<ChipProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const stateStyles = getStateStyles(selected, colors);
  const sizeStyles = getSizeStyles(size);

  // `PressableProps["disabled"]` is nullable; `accessibilityState` is not.
  const isDisabled = disabled ?? false;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: isDisabled }}
      disabled={isDisabled}
      style={(state) => [
        view(styles.rowCenter, styles.selfStart, styles.roundedFull, {
          opacity: isDisabled ? 0.5 : state.pressed ? 0.7 : 1,
          backgroundColor: stateStyles.bg,
          // Border width stays put across states so selecting a chip cannot
          // reflow the row it sits in.
          borderWidth: 1,
          borderColor: stateStyles.border,
          paddingVertical: sizeStyles.py,
          paddingHorizontal: sizeStyles.px,
          gap: sizeStyles.gap,
        }),
        typeof externalStyle === "function"
          ? externalStyle(state)
          : externalStyle,
      ]}
      {...rest}
    >
      <AppText variant={sizeStyles.textVariant} style={{ color: stateStyles.text }}>
        {label}
      </AppText>

      {onRemove && (
        // Its own Pressable, so dismissing never counts as selecting.
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          disabled={isDisabled}
          hitSlop={spacing[2]}
          onPress={onRemove}
        >
          <View style={view(styles.center)}>
            <AppText
              variant={sizeStyles.textVariant}
              style={{ color: stateStyles.text }}
            >
              ×
            </AppText>
          </View>
        </Pressable>
      )}
    </Pressable>
  );
}

function getStateStyles(selected: boolean, colors: ThemeColors) {
  if (selected) {
    return {
      bg: colors.primary,
      text: colors.primaryForeground,
      border: palette.transparent,
    };
  }

  return {
    bg: colors.secondary,
    text: colors.secondaryForeground,
    border: colors.border,
  };
}

function getSizeStyles(size: ChipSize) {
  switch (size) {
    case "sm":
      return {
        py: spacing[1],
        px: spacing[3],
        gap: spacing[1.5],
        textVariant: "caption" as const,
      };

    case "md":
      return {
        py: spacing[2],
        px: spacing[4],
        gap: spacing[2],
        textVariant: "label" as const,
      };
  }
}
