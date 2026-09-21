import { StyleSheet } from "react-native";

import { spacing } from "../tokens";

export const layout = StyleSheet.create({
  // Display / Flex
  flex1: { flex: 1 },
  flexGrow: { flexGrow: 1 },
  flexShrink: { flexShrink: 1 },
  flexGrow0: { flexGrow: 0 },
  flexShrink0: { flexShrink: 0 },
  flexNone: { flex: 0 },

  // Flex Direction
  flexRow: { flexDirection: "row" },
  flexCol: { flexDirection: "column" },
  flexRowReverse: { flexDirection: "row-reverse" },
  flexColReverse: { flexDirection: "column-reverse" },

  // Flex Wrap
  flexWrap: { flexWrap: "wrap" },
  flexNowrap: { flexWrap: "nowrap" },
  flexWrapReverse: { flexWrap: "wrap-reverse" },

  // Align Items
  itemsStart: { alignItems: "flex-start" },
  itemsCenter: { alignItems: "center" },
  itemsEnd: { alignItems: "flex-end" },
  itemsStretch: { alignItems: "stretch" },
  itemsBaseline: { alignItems: "baseline" },

  // Justify Content
  justifyStart: { justifyContent: "flex-start" },
  justifyCenter: { justifyContent: "center" },
  justifyEnd: { justifyContent: "flex-end" },
  justifyBetween: { justifyContent: "space-between" },
  justifyAround: { justifyContent: "space-around" },
  justifyEvenly: { justifyContent: "space-evenly" },

  // Align Self
  selfAuto: { alignSelf: "auto" },
  selfStart: { alignSelf: "flex-start" },
  selfCenter: { alignSelf: "center" },
  selfEnd: { alignSelf: "flex-end" },
  selfStretch: { alignSelf: "stretch" },
  selfBaseline: { alignSelf: "baseline" },

  // Position
  relative: { position: "relative" },
  absolute: { position: "absolute" },

  // Inset shortcuts
  inset0: { top: 0, right: 0, bottom: 0, left: 0 },
  top0: { top: 0 },
  right0: { right: 0 },
  bottom0: { bottom: 0 },
  left0: { left: 0 },

  // Overflow
  overflowHidden: { overflow: "hidden" },
  overflowVisible: { overflow: "visible" },

  // Z-Index
  z0: { zIndex: 0 },
  z10: { zIndex: 10 },
  z20: { zIndex: 20 },
  z30: { zIndex: 30 },
  z40: { zIndex: 40 },
  z50: { zIndex: 50 },

  // Common layout combos
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

/** Gap utilities — dynamically generated from spacing tokens since React Native's `gap` requires numeric values */
export const gap = StyleSheet.create(
  Object.fromEntries(
    Object.entries(spacing).map(([key, value]) => [`gap${key}`, { gap: value }])
  ) as Record<string, { gap: number }>
);

/** Grid-like helpers — React Native doesn't have CSS Grid, so this simulates it with flexbox + flexWrap */
export const grid = StyleSheet.create({
  gridCols1: { flexDirection: "row", flexWrap: "wrap" },
  gridCols2: { flexDirection: "row", flexWrap: "wrap" },
  gridCols3: { flexDirection: "row", flexWrap: "wrap" },
  gridCols4: { flexDirection: "row", flexWrap: "wrap" },
});

import type { ViewStyle } from "react-native";

/**
 * Calculate grid column width as a percentage based on the number of columns.
 * Used with `gridCols*` container styles to create a CSS Grid-like layout.
 *
 * @param cols - Number of columns (1-6)
 *
 * @example
 * <View style={styles.gridCols3}>
 *   <View style={gridCol(3)} />
 *   <View style={gridCol(3)} />
 * </View>
 */
export function gridCol(cols: 1 | 2 | 3 | 4 | 5 | 6): ViewStyle {
  return { width: `${100 / cols}%` };
}
