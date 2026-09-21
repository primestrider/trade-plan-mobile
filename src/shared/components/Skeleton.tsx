import {
  useEffect,
  useState,
} from "react";
import { Animated, View, type ViewProps } from "react-native";

import { useStyles, useTheme, view, type ThemedUtilities } from "@/styles";
import { spacing } from "@/styles/tokens";

/** Half a pulse. Slow enough to read as breathing rather than blinking. */
const PULSE_DURATION = 700;

const MIN_OPACITY = 0.4;

export type SkeletonProps = ViewProps & {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  circle?: boolean;
};

export type SkeletonTextProps = ViewProps & {
  lines?: number;
  lastLineWidth?: `${number}%`;
  /** Height of each bar. */
  height?: number;
  radius?: number;
};

/**
 * Pulsing placeholder for content that has not loaded yet.
 *
 * Opacity is the only animated property, so the loop can run on the native
 * driver and keep pulsing while JS is busy parsing the response it stands in
 * for — which is exactly when the placeholder is on screen.
 *
 * @example
 * <Skeleton height={spacing[12]} />
 * <Skeleton circle height={spacing[10]} />
 * <Skeleton.Text lines={2} />
 */
export function Skeleton({
  width = "100%",
  height = spacing[4],
  radius,
  circle = false,
  style,
  ...rest
}: Readonly<SkeletonProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const pulse = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: MIN_OPACITY,
          duration: PULSE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_DURATION,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    // An unstopped loop outlives the screen and keeps waking the UI thread.
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityRole="none"
      // A placeholder carries no information, so screen readers skip it and
      // announce the real content once it arrives.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        view(getRadiusStyle(circle, radius, styles), {
          width: circle ? height : width,
          height,
          backgroundColor: colors.secondary,
        }),
        { opacity: pulse },
        style,
      ]}
      {...rest}
    />
  );
}

/**
 * Stack of skeleton bars standing in for a paragraph.
 *
 * The last bar is short so the block reads as ragged prose rather than a
 * solid rectangle.
 *
 * @example
 * <Skeleton.Text lines={4} lastLineWidth="40%" />
 */
function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  height,
  radius,
  style,
  ...rest
}: Readonly<SkeletonTextProps>) {
  const styles = useStyles();

  return (
    <View
      accessibilityRole="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[view(styles.gap2), style]}
      {...rest}
    >
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : "100%"}
          height={height}
          radius={radius}
        />
      ))}
    </View>
  );
}

Skeleton.Text = SkeletonText;

function getRadiusStyle(
  circle: boolean,
  radius: number | undefined,
  styles: ThemedUtilities,
) {
  // A circle that is not fully rounded is not a circle, so it outranks an
  // explicit radius rather than quietly producing a rounded square.
  if (circle) return styles.roundedFull;
  if (radius !== undefined) return { borderRadius: radius };
  return styles.rounded2xl;
}
