import { StyleSheet } from "react-native";

import { palette, radii, type ThemeColors } from "../tokens";

type ColorShadeObject = {
  [shade: string]: string;
};

/**
 * Generate background, text, or border color utilities from the palette.
 * Creates entries like `bgRed500`, `textBlue200`, `borderGray300` for every color×shade combination.
 */
function buildColorUtilities<K extends string>(
  prefix: K,
  property: "backgroundColor" | "color" | "borderColor"
): Record<string, { [P in typeof property]: string }> {
  const styles: Record<string, { [P in typeof property]: string }> = {};

  for (const [colorName, value] of Object.entries(palette)) {
    if (typeof value === "string") {
      // Single color value (white, black, transparent)
      styles[`${prefix}${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`] = {
        [property]: value,
      } as any;
    } else {
      // Color shade object (red, blue, gray, etc.)
      const shades = value as Record<string, string | ColorShadeObject>;
      for (const [shade, colorValue] of Object.entries(shades)) {
        if (typeof colorValue === "string") {
          styles[`${prefix}${colorName.charAt(0).toUpperCase() + colorName.slice(1)}${shade}`] = {
            [property]: colorValue,
          } as any;
        }
      }
    }
  }

  return styles;
}

/**
 * Semantic color utilities for one theme.
 *
 * These are the only color utilities that depend on light/dark mode — the
 * `bg{Color}{Shade}` swatches above are generated from `palette`, which is
 * theme-independent. Built once per theme and cached in `@/styles`; reach
 * them through `useStyles()`, never through the static `styles` object.
 */
export function buildSemanticColors(theme: ThemeColors) {
  return StyleSheet.create({
    // Background
    bgBackground: { backgroundColor: theme.background },
    bgForeground: { backgroundColor: theme.foreground },
    bgPrimary: { backgroundColor: theme.primary },
    bgSecondary: { backgroundColor: theme.secondary },
    bgMuted: { backgroundColor: theme.muted },
    bgCard: { backgroundColor: theme.card },
    bgDestructive: { backgroundColor: theme.destructive },
    bgError: { backgroundColor: theme.destructive },
    bgSuccess: { backgroundColor: theme.success },
    bgWarning: { backgroundColor: theme.warning },
    bgInfo: { backgroundColor: theme.info },

    // Text color
    textForeground: { color: theme.foreground },
    textPrimary: { color: theme.primary },
    textSecondary: { color: theme.secondaryForeground },
    textMuted: { color: theme.muted },
    textMutedForeground: { color: theme.mutedForeground },
    textDestructive: { color: theme.destructive },
    textSuccess: { color: theme.success },
    textWarning: { color: theme.warning },
    textError: { color: theme.destructive },

    // Border
    borderBorder: { borderColor: theme.border },
    borderPrimary: { borderColor: theme.primary },
    borderDestructive: { borderColor: theme.destructive },
    borderSuccess: { borderColor: theme.success },
    borderWarning: { borderColor: theme.warning },
    borderInfo: { borderColor: theme.info },
  });
}

export type SemanticColorUtilities = ReturnType<typeof buildSemanticColors>;

export const appearance = StyleSheet.create({
  ...buildColorUtilities("bg", "backgroundColor"),
  ...buildColorUtilities("text", "color"),
  ...buildColorUtilities("border", "borderColor"),

  // Border Width
  border0: { borderWidth: 0 },
  border: { borderWidth: 1 },
  border2: { borderWidth: 2 },
  border4: { borderWidth: 4 },
  borderT: { borderTopWidth: 1 },
  borderR: { borderRightWidth: 1 },
  borderB: { borderBottomWidth: 1 },
  borderL: { borderLeftWidth: 1 },

  // Border Radius
  roundedNone: { borderRadius: radii.none },
  roundedSm: { borderRadius: radii.sm },
  rounded: { borderRadius: radii.DEFAULT },
  roundedMd: { borderRadius: radii.md },
  roundedLg: { borderRadius: radii.lg },
  roundedXl: { borderRadius: radii.xl },
  rounded2xl: { borderRadius: radii["2xl"] },
  rounded3xl: { borderRadius: radii["3xl"] },
  roundedFull: { borderRadius: radii.full },

  // Individual corners
  roundedT: {
    borderTopLeftRadius: radii.DEFAULT,
    borderTopRightRadius: radii.DEFAULT,
  },
  roundedB: {
    borderBottomLeftRadius: radii.DEFAULT,
    borderBottomRightRadius: radii.DEFAULT,
  },
  roundedL: {
    borderTopLeftRadius: radii.DEFAULT,
    borderBottomLeftRadius: radii.DEFAULT,
  },
  roundedR: {
    borderTopRightRadius: radii.DEFAULT,
    borderBottomRightRadius: radii.DEFAULT,
  },

  // Opacity
  opacity0: { opacity: 0 },
  opacity25: { opacity: 0.25 },
  opacity50: { opacity: 0.5 },
  opacity75: { opacity: 0.75 },
  opacity100: { opacity: 1 },

  // Shadow
  shadowSm: {
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    elevation: 1,
  },
  shadow: {
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    elevation: 3,
  },
  shadowMd: {
    boxShadow: "0 4px 6px rgba(0,0,0,0.12)",
    elevation: 5,
  },
  shadowLg: {
    boxShadow: "0 8px 12px rgba(0,0,0,0.15)",
    elevation: 8,
  },
  shadowNone: {
    boxShadow: "none",
    elevation: 0,
  },
});
