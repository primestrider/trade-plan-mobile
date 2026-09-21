import {
  useEffect,
  useState,
} from "react";
import { Animated, Pressable, View, type PressableProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { palette, radii } from "@/styles/tokens";

import { AppText } from "./AppText";

/**
 * Control metrics, not layout spacing — these are the platform's own switch
 * proportions, which is what makes a custom switch read as native rather than
 * as a rounded rectangle someone drew. They deliberately sit outside the
 * spacing scale.
 */
const METRICS = {
  sm: { track: { width: 40, height: 24 }, thumb: 20, inset: 2 },
  md: { track: { width: 51, height: 31 }, thumb: 27, inset: 2 },
} as const;

/** Tuned to settle quickly with a trace of overshoot, the way iOS does. */
const SPRING = { friction: 7, tension: 90 };

type SwitchSize = keyof typeof METRICS;

export type SwitchProps = Omit<PressableProps, "onPress"> & {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  size?: SwitchSize;
  label?: string;
  description?: string;
};

/**
 * Toggle for an immediate, self-applying setting.
 *
 * Custom-drawn rather than React Native's `Switch` so it answers to the theme
 * tokens — the platform control ignores most styling. The spring, the thumb
 * shadow, and the platform track metrics are what carry the native feel.
 *
 * Named `value`/`onValueChange` to match React Native's own switch, so swapping
 * either way is a drop-in.
 *
 * @example
 * <Switch value={notify} onValueChange={setNotify} label="Notifications" />
 */
export function Switch({
  value = false,
  onValueChange,
  size = "md",
  label,
  description,
  disabled,
  style: externalStyle,
  ...rest
}: Readonly<SwitchProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  // `PressableProps` allows null here; accessibilityState does not.
  const isDisabled = disabled ?? false;

  const metrics = METRICS[size];
  const travel = metrics.track.width - metrics.thumb - metrics.inset * 2;

  const progress = useState(() => new Animated.Value(value ? 1 : 0))[0];

  useEffect(() => {
    const animation = Animated.spring(progress, {
      toValue: value ? 1 : 0,
      ...SPRING,
      // The track's color is interpolated too, and color cannot be driven
      // natively — one value drives both so they can never fall out of step.
      useNativeDriver: false,
    });

    animation.start();

    return () => animation.stop();
  }, [value, progress]);

  // Animated values are passed as plain style objects: `view()` narrows to
  // ViewStyle, which has no room for an interpolation.
  const control = (
    <Animated.View
      testID="switch-track"
      style={{
        width: metrics.track.width,
        height: metrics.track.height,
        borderRadius: radii.full,
        padding: metrics.inset,
        backgroundColor: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.border, colors.primary],
        }),
      }}
    >
      <Animated.View
        testID="switch-thumb"
        style={[
          styles.shadowSm,
          {
            width: metrics.thumb,
            height: metrics.thumb,
            borderRadius: radii.full,
            backgroundColor: palette.white,
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, travel],
                }),
              },
            ],
          },
        ]}
      />
    </Animated.View>
  );

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => onValueChange?.(!value)}
      style={(state) => [
        view(
          styles.flexRow,
          styles.itemsCenter,
          styles.gap3,
          isDisabled && styles.opacity50,
        ),
        typeof externalStyle === "function"
          ? externalStyle(state)
          : externalStyle,
      ]}
      {...rest}
    >
      {label || description ? (
        <View style={view(styles.flex1, styles.gap1, { minWidth: 0 })}>
          {label ? <AppText>{label}</AppText> : null}
          {description ? (
            <AppText variant="caption" color="muted">
              {description}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {control}
    </Pressable>
  );
}
