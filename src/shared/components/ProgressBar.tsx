import {
  useEffect,
  useState,
} from "react";
import { Animated, View, type ViewProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { spacing, type ThemeColors } from "@/styles/tokens";

import { AppText } from "./AppText";

type ProgressBarVariant = "primary" | "success" | "warning" | "destructive";

type ProgressBarSize = "sm" | "md";

/** Width of the sliding chip in indeterminate mode, as a share of the track. */
const CHIP_WIDTH = "40%";

const FILL_DURATION = 240;

const SLIDE_DURATION = 1200;

export type ProgressBarProps = ViewProps & {
  /** 0..1, clamped. */
  value?: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  indeterminate?: boolean;
  label?: string;
};

/**
 * Horizontal progress track with a determinate or indeterminate fill.
 *
 * The animated value is seeded with the first `value` instead of starting at
 * zero, so a bar mounted mid-task renders at its real position rather than
 * sweeping in from empty.
 *
 * @example
 * <ProgressBar value={0.35} label="Uploading" />
 * <ProgressBar indeterminate variant="success" />
 */
export function ProgressBar({
  value = 0,
  variant = "primary",
  size = "md",
  indeterminate = false,
  label,
  style,
  ...rest
}: Readonly<ProgressBarProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const variantStyles = getVariantStyles(variant, colors);
  const sizeStyles = getSizeStyles(size);

  const clamped = clamp(value);
  const percent = Math.round(clamped * 100);

  const progress = useState(() => new Animated.Value(clamped))[0];
  const slide = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (indeterminate) return;

    const animation = Animated.timing(progress, {
      toValue: clamped,
      duration: FILL_DURATION,
      // Width is a layout property; the native driver cannot drive it.
      useNativeDriver: false,
    });

    animation.start();

    return () => animation.stop();
  }, [clamped, indeterminate, progress]);

  useEffect(() => {
    if (!indeterminate) return;

    const loop = Animated.loop(
      Animated.timing(slide, {
        toValue: 1,
        duration: SLIDE_DURATION,
        useNativeDriver: false,
      }),
    );

    loop.start();

    // An unstopped loop outlives the screen and keeps waking the UI thread.
    return () => loop.stop();
  }, [indeterminate, slide]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // The chip starts fully off the leading edge and exits past the trailing one.
  const chipOffset = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [`-${CHIP_WIDTH}`, "100%"],
  });

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={
        indeterminate ? undefined : { now: percent, min: 0, max: 100 }
      }
      style={[view(styles.wFull, styles.gap1), style]}
      {...rest}
    >
      {label ? (
        <View style={view(styles.rowBetween)}>
          <AppText variant="caption" color="muted">
            {label}
          </AppText>

          {/* A percentage would be a lie while the total is unknown. */}
          {indeterminate ? null : (
            <AppText variant="caption" color="muted">
              {`${percent}%`}
            </AppText>
          )}
        </View>
      ) : null}

      <View
        style={view(
          styles.wFull,
          styles.roundedFull,
          // Keeps the indeterminate chip clipped to the rounded track.
          styles.overflowHidden,
          {
            height: sizeStyles.height,
            backgroundColor: colors.secondary,
          },
        )}
      >
        {indeterminate ? (
          <Animated.View
            style={view(styles.absolute, styles.hFull, styles.roundedFull, {
              width: CHIP_WIDTH,
              left: chipOffset,
              backgroundColor: variantStyles.fill,
            })}
          />
        ) : (
          <Animated.View
            style={view(styles.hFull, styles.roundedFull, {
              width: fillWidth,
              backgroundColor: variantStyles.fill,
            })}
          />
        )}
      </View>
    </View>
  );
}

/** Keeps a caller's out-of-range or missing number from breaking the layout. */
function clamp(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function getVariantStyles(variant: ProgressBarVariant, colors: ThemeColors) {
  switch (variant) {
    case "primary":
      return { fill: colors.primary };

    case "success":
      return { fill: colors.success };

    case "warning":
      return { fill: colors.warning };

    case "destructive":
      return { fill: colors.destructive };
  }
}

function getSizeStyles(size: ProgressBarSize) {
  switch (size) {
    case "sm":
      return { height: spacing[1] };

    case "md":
      return { height: spacing[2] };
  }
}
