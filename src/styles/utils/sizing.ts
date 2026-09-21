import { StyleSheet } from "react-native";

import { spacing } from "../tokens";

const percent = (n: number) => `${n}%` as `${number}%`;

export const sizing = StyleSheet.create({
  // Width
  wFull: { width: "100%" },
  wHalf: { width: percent(50) },
  wThird: { width: percent(33.333) },
  wTwoThirds: { width: percent(66.666) },
  wQuarter: { width: percent(25) },
  wThreeQuarters: { width: percent(75) },
  wAuto: { width: "auto" },
  wScreen: { width: "100%" },

  // Height
  hFull: { height: "100%" },
  hHalf: { height: percent(50) },
  hThird: { height: percent(33.333) },
  hTwoThirds: { height: percent(66.666) },
  hAuto: { height: "auto" },
  hScreen: { height: "100%" },

  // Min/Max
  minW0: { minWidth: 0 },
  minWFull: { minWidth: "100%" },
  maxWFull: { maxWidth: "100%" },
  minH0: { minHeight: 0 },
  minHFull: { minHeight: "100%" },
  maxHFull: { maxHeight: "100%" },

  // Aspect ratio
  aspectSquare: { aspectRatio: 1 },
  aspectVideo: { aspectRatio: 16 / 9 },

  // Size (width + height)
  sizeFull: { width: "100%", height: "100%" },
});

/** Width/height from spacing tokens — w-4, h-8, size-12 */
export const fixedSize = StyleSheet.create(
  Object.fromEntries(
    Object.entries(spacing).flatMap(([key, value]) => [
      [`w${key}`, { width: value }],
      [`h${key}`, { height: value }],
      [`size${key}`, { width: value, height: value }],
      [`minW${key}`, { minWidth: value }],
      [`minH${key}`, { minHeight: value }],
      [`maxW${key}`, { maxWidth: value }],
      [`maxH${key}`, { maxHeight: value }],
    ])
  ) as Parameters<typeof StyleSheet.create>[0]
);
