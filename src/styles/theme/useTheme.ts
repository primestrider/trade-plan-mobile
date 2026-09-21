import { useColorScheme } from "react-native";

import { colors, darkColors, type ThemeColors } from "../tokens";
import { useThemeStore, type ThemeMode } from "./store";

export type ColorScheme = "light" | "dark";

const themes: Record<ColorScheme, ThemeColors> = {
  light: colors,
  dark: darkColors,
};

/**
 * Resolves the user's preference and the OS setting into the scheme actually
 * being rendered, plus that scheme's semantic colors.
 *
 * Use this for raw color values (native chrome, icon tints, animated colors).
 * For utility styles, prefer `useStyles()` from `@/styles`.
 *
 * @example
 * const { colors, isDark, mode, setMode } = useTheme();
 * <StatusBar style={isDark ? 'light' : 'dark'} />
 */
export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const systemScheme = useColorScheme();

  // `useColorScheme()` may report null, undefined, or "unspecified" — anything
  // that is not an explicit dark signal falls back to light.
  const scheme: ColorScheme =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  return {
    /** The user's preference: may be `system`. */
    mode,
    setMode,
    /** The scheme actually rendered: never `system`. */
    scheme,
    isDark: scheme === "dark",
    colors: themes[scheme],
  };
}

export type { ThemeMode };
