import {
  useEffect,
  useState,
} from "react";
import { Animated, Pressable, View, type PressableProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { palette, spacing } from "@/styles/tokens";

import { AppText } from "./AppText";

type CheckboxSize = "sm" | "md";

export type CheckboxProps = Omit<PressableProps, "onPress"> & {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
  size?: CheckboxSize;
};

/** Stable hooks for tests and for consumers that need to reach the box or its mark. */
export const CHECKBOX_BOX_TEST_ID = "checkbox-box";
export const CHECKBOX_MARK_TEST_ID = "checkbox-mark";

/** Fast enough to feel like a direct response to the tap, not a transition. */
const MARK_DURATION = 150;

/**
 * Checkmark geometry as a fraction of the box, so the glyph keeps its
 * proportions at every size instead of needing a hand-tuned pair per size.
 */
const MARK_WIDTH_RATIO = 0.32;
const MARK_HEIGHT_RATIO = 0.58;
const BAR_WIDTH_RATIO = 0.5;

/**
 * Controlled checkbox with an optional label, description and error.
 *
 * Holds no state: it renders `checked` and reports the value the caller should
 * move to. A self-toggling checkbox drifts out of sync with the form state it
 * is supposed to represent.
 *
 * @example
 * <Checkbox checked={agreed} onChange={setAgreed} label="I agree" />
 * <Checkbox indeterminate label="Select all" onChange={selectAll} />
 */
export function Checkbox({
  checked = false,
  onChange,
  label,
  description,
  error,
  indeterminate = false,
  size = "md",
  disabled = false,
  style,
  ...rest
}: Readonly<CheckboxProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const sizeStyles = getSizeStyles(size);

  // React Native types `disabled` as nullable; normalize once so the reported
  // state and the dimming never disagree.
  const isDisabled = disabled ?? false;

  // Indeterminate outranks `checked`: a partially-selected parent row reads as
  // filled whatever its own value happens to be.
  const filled = indeterminate || checked;

  const mark = useState(() => new Animated.Value(filled ? 1 : 0))[0];

  useEffect(() => {
    const animation = Animated.timing(mark, {
      toValue: filled ? 1 : 0,
      duration: MARK_DURATION,
      useNativeDriver: true,
    });

    animation.start();

    // An animation left running outlives the row and keeps the UI thread awake.
    return () => animation.stop();
  }, [filled, mark]);

  return (
    <View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: indeterminate ? "mixed" : checked,
          disabled: isDisabled,
        }}
        disabled={isDisabled}
        onPress={() => onChange?.(!checked)}
        style={(state) => [
          view(
            styles.flexRow,
            // With a description the text block is taller than the box, so the
            // box tracks the label line rather than floating mid-paragraph.
            description ? styles.itemsStart : styles.itemsCenter,
            { gap: sizeStyles.gap },
            isDisabled && styles.opacity50,
            !isDisabled && state.pressed && styles.opacity75,
          ),
          typeof style === "function" ? style(state) : style,
        ]}
        {...rest}
      >
        {/* `roundedMd`, never `roundedFull`: the square shape is what tells the
            user this is a multi-select. A round checkbox is a radio. */}
        <View
          testID={CHECKBOX_BOX_TEST_ID}
          style={view(
            styles.roundedMd,
            styles.itemsCenter,
            styles.justifyCenter,
            {
              width: sizeStyles.box,
              height: sizeStyles.box,
              borderWidth: sizeStyles.stroke,
              borderColor: filled ? colors.primary : colors.border,
              backgroundColor: filled ? colors.primary : palette.transparent,
            },
          )}
        >
          <Animated.View
            style={{ opacity: mark, transform: [{ scale: mark }] }}
          >
            {indeterminate ? (
              <View
                testID={CHECKBOX_MARK_TEST_ID}
                style={view(styles.roundedFull, {
                  width: sizeStyles.box * BAR_WIDTH_RATIO,
                  height: sizeStyles.stroke,
                  backgroundColor: colors.primaryForeground,
                })}
              />
            ) : (
              // No icon library in this project: two borders on a rectangle,
              // rotated, are the checkmark.
              <View
                testID={CHECKBOX_MARK_TEST_ID}
                style={view({
                  width: sizeStyles.box * MARK_WIDTH_RATIO,
                  height: sizeStyles.box * MARK_HEIGHT_RATIO,
                  borderBottomWidth: sizeStyles.stroke,
                  borderRightWidth: sizeStyles.stroke,
                  borderColor: colors.primaryForeground,
                  transform: [{ rotate: "45deg" }],
                  // Rotating about the center leaves the tick sitting low.
                  marginTop: -sizeStyles.stroke,
                })}
              />
            )}
          </Animated.View>
        </View>

        {label || description ? (
          // `minW0` is what lets a long label wrap instead of widening the row.
          <View style={view(styles.flex1, styles.minW0)}>
            {label ? (
              <AppText variant={sizeStyles.label}>{label}</AppText>
            ) : null}
            {description ? (
              <AppText variant="caption" color="muted">
                {description}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </Pressable>

      {error ? (
        <AppText
          variant="label"
          color="destructive"
          style={styles["mt1.5"]}
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function getSizeStyles(size: CheckboxSize) {
  switch (size) {
    case "sm":
      return {
        box: spacing[4],
        gap: spacing[2],
        stroke: 1.5,
        label: "label" as const,
      };

    case "md":
      return {
        box: spacing[5],
        gap: spacing[3],
        stroke: 2,
        label: "body" as const,
      };
  }
}
