import {
  useEffect,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  View,
  type PressableProps,
  type ViewProps,
} from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { spacing } from "@/styles/tokens";

import { AppText } from "./AppText";

type RadioSize = "sm" | "md";

export type RadioProps = Omit<PressableProps, "onPress"> & {
  selected?: boolean;
  onSelect?: () => void;
  label?: string;
  description?: string;
  size?: RadioSize;
};

export type RadioGroupOption<T> = {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type RadioGroupProps<T> = ViewProps & {
  options: RadioGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  error?: string;
};

/** Stable hooks for tests and for consumers that need to reach the ring or dot. */
export const RADIO_RING_TEST_ID = "radio-ring";
export const RADIO_DOT_TEST_ID = "radio-dot";

/** Matches the checkbox mark, so a mixed form settles in one beat. */
const DOT_DURATION = 150;

/** Dot diameter as a fraction of the ring — keeps the proportion at any size. */
const DOT_RATIO = 0.5;

/**
 * Single radio option: ring, animated dot, optional label and description.
 *
 * Reports only that it was chosen — `onSelect` takes no argument, because a
 * radio can never be turned off by tapping it, only replaced by another.
 *
 * @example
 * <Radio selected={plan === "pro"} onSelect={() => setPlan("pro")} label="Pro" />
 */
export function Radio({
  selected = false,
  onSelect,
  label,
  description,
  size = "md",
  disabled = false,
  style,
  ...rest
}: Readonly<RadioProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const sizeStyles = getSizeStyles(size);

  // React Native types `disabled` as nullable; normalize once so the reported
  // state and the dimming never disagree.
  const isDisabled = disabled ?? false;

  const dot = useState(() => new Animated.Value(selected ? 1 : 0))[0];

  useEffect(() => {
    const animation = Animated.timing(dot, {
      toValue: selected ? 1 : 0,
      duration: DOT_DURATION,
      useNativeDriver: true,
    });

    animation.start();

    // An animation left running outlives the row and keeps the UI thread awake.
    return () => animation.stop();
  }, [selected, dot]);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onSelect}
      style={(state) => [
        view(
          styles.flexRow,
          // With a description the text block is taller than the ring, so the
          // ring tracks the label line rather than floating mid-paragraph.
          description ? styles.itemsStart : styles.itemsCenter,
          { gap: sizeStyles.gap },
          isDisabled && styles.opacity50,
          !isDisabled && state.pressed && styles.opacity75,
        ),
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      <View
        testID={RADIO_RING_TEST_ID}
        style={view(
          styles.roundedFull,
          styles.itemsCenter,
          styles.justifyCenter,
          {
            width: sizeStyles.ring,
            height: sizeStyles.ring,
            borderWidth: sizeStyles.stroke,
            borderColor: selected ? colors.primary : colors.border,
          },
        )}
      >
        {/* The dot is always mounted: unmounting it would cut the fade-out
            short and make deselection snap. */}
        <Animated.View
          style={[
            view(styles.roundedFull, {
              width: sizeStyles.ring * DOT_RATIO,
              height: sizeStyles.ring * DOT_RATIO,
              backgroundColor: colors.primary,
            }),
            { opacity: dot, transform: [{ scale: dot }] },
          ]}
          testID={RADIO_DOT_TEST_ID}
        />
      </View>

      {label || description ? (
        // `minW0` is what lets a long label wrap instead of widening the row.
        <View style={view(styles.flex1, styles.minW0)}>
          {label ? <AppText variant={sizeStyles.label}>{label}</AppText> : null}
          {description ? (
            <AppText variant="caption" color="muted">
              {description}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * Column of radios that owns the one-of-many contract.
 *
 * Generic over the option value, so `value` and `onChange` keep the caller's
 * own union rather than degrading to `string`.
 *
 * @example
 * <Radio.Group
 *   accessibilityLabel="Billing period"
 *   options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
 *   value={period}
 *   onChange={setPeriod}
 * />
 */
function RadioGroup<T>({
  options,
  value,
  onChange,
  error,
  accessibilityLabel = "Select one option",
  style,
  ...rest
}: Readonly<RadioGroupProps<T>>) {
  const styles = useStyles();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[view(styles.gap3), style]}
      {...rest}
    >
      {options.map((option) => (
        <Radio
          key={String(option.value)}
          selected={option.value === value}
          onSelect={() => onChange(option.value)}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
        />
      ))}

      {error ? (
        <AppText variant="label" color="destructive">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

Radio.Group = RadioGroup;

function getSizeStyles(size: RadioSize) {
  switch (size) {
    case "sm":
      return {
        ring: spacing[4],
        gap: spacing[2],
        stroke: 1.5,
        label: "label" as const,
      };

    case "md":
      return {
        ring: spacing[5],
        gap: spacing[3],
        stroke: 2,
        label: "body" as const,
      };
  }
}
