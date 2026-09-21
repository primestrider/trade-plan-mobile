import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Animated, Pressable, View, type ViewProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { spacing } from "@/styles/tokens";

import { AppText } from "./AppText";
import { Divider } from "./Divider";

export type AccordionItem = { key: string; title: string; content: ReactNode };

export type AccordionProps = ViewProps & {
  items: AccordionItem[];
  /** Keys open on first render. */
  defaultOpenKeys?: string[];
  /** Collapses the open item when another is opened. */
  single?: boolean;
};

const EXPAND_DURATION = 200;

/** Test hooks — stable enough for consumers to target a specific row. */
export const accordionHeaderTestID = (key: string) => `accordion-header-${key}`;
/** The collapsible wrapper whose height animates. */
export const accordionPanelTestID = (key: string) => `accordion-panel-${key}`;
/** The measured content inside the panel. */
export const accordionContentTestID = (key: string) =>
  `accordion-content-${key}`;
export const accordionChevronTestID = (key: string) =>
  `accordion-chevron-${key}`;

/**
 * Stack of collapsible sections.
 *
 * Uncontrolled by design: open state is local, and `defaultOpenKeys` is read
 * once. A controlled mode would make every caller own state it rarely needs.
 *
 * @example
 * <Accordion
 *   single
 *   defaultOpenKeys={["billing"]}
 *   items={[
 *     { key: "billing", title: "Billing", content: <BillingPanel /> },
 *     { key: "privacy", title: "Privacy", content: <PrivacyPanel /> },
 *   ]}
 * />
 */
export function Accordion({
  items,
  defaultOpenKeys,
  single = false,
  style,
  ...rest
}: Readonly<AccordionProps>) {
  const [openKeys, setOpenKeys] = useState<string[]>(
    () => defaultOpenKeys ?? [],
  );

  const toggle = useCallback(
    (key: string) => {
      setOpenKeys((current) => {
        if (current.includes(key)) return current.filter((k) => k !== key);
        return single ? [key] : [...current, key];
      });
    },
    [single],
  );

  return (
    <View style={style} {...rest}>
      {items.map((item, index) => (
        <View key={item.key}>
          {index > 0 ? <Divider /> : null}
          <AccordionRow
            item={item}
            expanded={openKeys.includes(item.key)}
            onToggle={toggle}
          />
        </View>
      ))}
    </View>
  );
}

type AccordionRowProps = {
  item: AccordionItem;
  expanded: boolean;
  onToggle: (key: string) => void;
};

/**
 * One header + collapsible body.
 *
 * The body is measured, not guessed: an absolutely positioned wrapper reports
 * its natural height through `onLayout`, and the visible wrapper animates its
 * own height to that number. Absolute positioning matters — a child inside a
 * height-animated parent would be squeezed and re-measure on every frame.
 */
function AccordionRow({ item, expanded, onToggle }: Readonly<AccordionRowProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const [contentHeight, setContentHeight] = useState(0);
  // `useNativeDriver` stays false: the native driver cannot animate height.
  const progress = useState(() => new Animated.Value(expanded ? 1 : 0))[0];

  useEffect(() => {
    Animated.timing(progress, {
      toValue: expanded ? 1 : 0,
      duration: EXPAND_DURATION,
      useNativeDriver: false,
    }).start();
  }, [expanded, progress]);

  const height = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        testID={accordionHeaderTestID(item.key)}
        onPress={() => onToggle(item.key)}
        style={(state) =>
          view(
            styles.flexRow,
            styles.itemsCenter,
            styles.gap3,
            styles.py4,
            { minHeight: spacing[14] },
            state.pressed && { opacity: 0.7 },
          )
        }
      >
        <View style={view(styles.flex1, styles.minW0)}>
          <AppText variant="body" numberOfLines={2}>
            {item.title}
          </AppText>
        </View>

        {/* No icon library: two borders on a rotated square draw the caret.
            The colour stays in a plain style so it flattens predictably. */}
        <Animated.View
          testID={accordionChevronTestID(item.key)}
          style={[
            view(styles.size2, {
              borderTopWidth: 1.5,
              borderRightWidth: 1.5,
              borderColor: colors.mutedForeground,
            }),
            { transform: [{ rotate }] },
          ]}
        />
      </Pressable>

      <Animated.View
        testID={accordionPanelTestID(item.key)}
        pointerEvents={expanded ? "auto" : "none"}
        style={[view(styles.overflowHidden), { height }]}
      >
        <View
          testID={accordionContentTestID(item.key)}
          onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
          style={view(
            styles.absolute,
            styles.top0,
            styles.left0,
            styles.right0,
            styles.pb4,
          )}
        >
          {item.content}
        </View>
      </Animated.View>
    </View>
  );
}
