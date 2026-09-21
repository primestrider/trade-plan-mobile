import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  View,
  type LayoutChangeEvent,
  type ViewProps,
} from "react-native";

import { useStyles, useTheme, view, type ThemedUtilities } from "@/styles";
import { spacing } from "@/styles/tokens";

import { AppText, type AppTextProps } from "./AppText";

type TabsVariant = "segmented" | "underline";

type TabsSize = "sm" | "md";

/** Measured position of one tab, in the row's own coordinates. */
type TabLayout = { x: number; width: number };

const INDICATOR_DURATION = 200;

/** The sliding bar under the active tab of an `underline` Tabs. */
export const TABS_INDICATOR_TEST_ID = "tabs-indicator";

export type TabItem<T> = { value: T; label: string };

export type TabsProps<T> = ViewProps & {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: TabsVariant;
  size?: TabsSize;
};

/**
 * Controlled tab strip, either as a segmented control or as an underlined row.
 *
 * Generic over the tab value so a caller's string or number union survives into
 * `onChange` — a `string` API would push every consumer back through a cast.
 *
 * Controlled on purpose: the selected tab is almost always already derived from
 * route or screen state, and a second internal copy is what makes tabs and
 * content drift apart.
 *
 * @example
 * <Tabs
 *   value={range}
 *   onChange={setRange}
 *   items={[
 *     { value: "week", label: "Week" },
 *     { value: "month", label: "Month" },
 *   ]}
 * />
 */
export function Tabs<T>({
  items,
  value,
  onChange,
  variant = "segmented",
  size = "md",
  style,
  ...rest
}: Readonly<TabsProps<T>>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const variantStyles = getVariantStyles(variant, styles);
  const sizeStyles = getSizeStyles(size);

  const [layouts, setLayouts] = useState<Record<number, TabLayout>>({});
  const indicatorLeft = useState(() => new Animated.Value(0))[0];
  const indicatorWidth = useState(() => new Animated.Value(0))[0];
  // The first measurement must place the bar, not slide it in from the edge.
  const placed = useRef(false);

  const activeIndex = items.findIndex((item) => item.value === value);
  const activeLayout = activeIndex === -1 ? undefined : layouts[activeIndex];

  useEffect(() => {
    if (variant !== "underline" || !activeLayout) return;

    if (!placed.current) {
      placed.current = true;
      indicatorLeft.setValue(activeLayout.x);
      indicatorWidth.setValue(activeLayout.width);
      return;
    }

    const animation = Animated.parallel([
      Animated.timing(indicatorLeft, {
        toValue: activeLayout.x,
        duration: INDICATOR_DURATION,
        // `left`/`width` are layout props; the native driver cannot run them.
        useNativeDriver: false,
      }),
      Animated.timing(indicatorWidth, {
        toValue: activeLayout.width,
        duration: INDICATOR_DURATION,
        useNativeDriver: false,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [variant, activeLayout, indicatorLeft, indicatorWidth]);

  const measure = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;

    setLayouts((current) => {
      const previous = current[index];
      // Layout fires on every re-render; bail out so state stays referentially
      // stable and the indicator effect does not restart for nothing.
      if (previous && previous.x === x && previous.width === width) {
        return current;
      }

      return { ...current, [index]: { x, width } };
    });
  };

  return (
    <View
      accessibilityRole="tablist"
      style={[variantStyles.track, style]}
      {...rest}
    >
      {items.map((item, index) => {
        const selected = item.value === value;

        return (
          <Pressable
            key={String(item.value)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            onLayout={variant === "underline" ? measure(index) : undefined}
            // Re-selecting the active tab is a no-op, not a state round trip.
            onPress={() => {
              if (!selected) onChange(item.value);
            }}
            style={({ pressed }) =>
              view(
                variantStyles.tab,
                {
                  paddingVertical: sizeStyles.py,
                  paddingHorizontal: sizeStyles.px,
                },
                selected && variantStyles.activeTab,
                !selected && pressed && styles.opacity75,
              )
            }
          >
            <AppText
              variant={sizeStyles.textVariant}
              weight={selected ? "semibold" : "medium"}
              color={selected ? variantStyles.activeColor : "muted"}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}

      {variant === "underline" ? (
        <Animated.View
          testID={TABS_INDICATOR_TEST_ID}
          style={[
            view(styles.absolute, styles.bottom0, styles.roundedFull, {
              height: sizeStyles.indicator,
              backgroundColor: colors.primary,
            }),
            { left: indicatorLeft, width: indicatorWidth },
          ]}
        />
      ) : null}
    </View>
  );
}

function getVariantStyles(variant: TabsVariant, styles: ThemedUtilities) {
  switch (variant) {
    // Generalizes `ThemeToggle`: a recessed track with a raised card thumb.
    case "segmented":
      return {
        track: view(
          styles.flexRow,
          styles.bgSecondary,
          styles.roundedFull,
          styles.p1,
          styles.gap1,
        ),
        tab: view(styles.flex1, styles.center, styles.roundedFull),
        activeTab: styles.bgCard,
        activeColor: "foreground" as const,
      };

    // No track at all — `relative` only exists to anchor the indicator.
    case "underline":
      return {
        track: view(styles.flexRow, styles.relative),
        tab: view(styles.center),
        activeTab: undefined,
        activeColor: "primary" as const,
      };
  }
}

function getSizeStyles(size: TabsSize) {
  switch (size) {
    case "sm":
      return {
        py: spacing[1.5],
        px: spacing[2.5],
        indicator: spacing[0.5],
        textVariant: "caption" as AppTextProps["variant"],
      };

    case "md":
      return {
        py: spacing[2],
        px: spacing[3],
        indicator: spacing[1],
        textVariant: "label" as AppTextProps["variant"],
      };
  }
}
