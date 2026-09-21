import {
  appearance,
  buildSemanticColors,
  fixedSize,
  gap,
  grid,
  gridCol,
  layout,
  margin,
  negativeMargin,
  padding,
  sizing,
  typography,
  type SemanticColorUtilities,
} from "./utils";
import { space, view, vx, text } from "./helpers";
import { useTheme, type ColorScheme } from "./theme/useTheme";
import { colors, darkColors } from "./tokens";
import type { Utilities } from "./types";

/**
 * Utility styles — Tailwind-like API using React Native's built-in StyleSheet.
 *
 * @example
 * import { styles, view } from '@/styles';
 *
 * <View style={view(styles.flex1, styles.p4, styles.bgBackground)}>
 *   <Text style={text(styles.textLg, styles.fontBold, styles.textForeground)}>Hello</Text>
 * </View>
 */
export const styles = {
  ...layout,
  ...gap,
  ...grid,
  ...padding,
  ...margin,
  ...negativeMargin,
  ...sizing,
  ...fixedSize,
  ...typography,
  ...appearance,
} as Utilities;

/** Every utility, including the semantic colors of one theme. */
export type ThemedUtilities = Utilities & SemanticColorUtilities;

/**
 * Both themes are assembled once at module load, so switching theme swaps a
 * cached object reference instead of rebuilding ~2000 styles.
 */
const themedStyles: Record<ColorScheme, ThemedUtilities> = {
  light: { ...styles, ...buildSemanticColors(colors) },
  dark: { ...styles, ...buildSemanticColors(darkColors) },
};

/**
 * Theme-aware utility styles.
 *
 * Semantic colors (`bgBackground`, `textForeground`, `borderBorder`, …) live
 * here rather than on the static `styles` object, so a surface can never be
 * accidentally pinned to light mode.
 *
 * Name the result `styles` and the rest of the component stays unchanged:
 *
 * @example
 * import { text, useStyles, view } from '@/styles';
 *
 * export function Card() {
 *   const styles = useStyles();
 *   return <View style={view(styles.p4, styles.bgCard, styles.roundedLg)} />;
 * }
 */
export function useStyles(): ThemedUtilities {
  return themedStyles[useTheme().scheme];
}

export { view, space, text, vx, gridCol };

// Theme state and resolved colors
export { useTheme } from "./theme/useTheme";
export type { ColorScheme } from "./theme/useTheme";
export { useThemeStore } from "./theme/store";
export type { ThemeMode } from "./theme/store";

// Re-export tokens for direct access
export * from "./tokens";

// Re-export individual utility groups
export {
  layout,
  gap,
  grid,
  padding,
  margin,
  negativeMargin,
  sizing,
  fixedSize,
  typography,
  appearance,
} from "./utils";
