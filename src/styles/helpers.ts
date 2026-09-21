import type {
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

import { fontFamily } from "./tokens";

type Falsy = false | null | undefined | "";

/**
 * Filters out falsy values from a style array and returns a single merged style.
 * Returns `undefined` for empty arrays, the single style for arrays of length 1,
 * or the array itself for multiple styles (React Native handles array merging natively).
 */
function filterStyles<T extends ViewStyle | TextStyle | ImageStyle>(
  styles: (StyleProp<T> | Falsy)[]
): StyleProp<T> {
  const filtered = styles.filter(
    (style): style is NonNullable<typeof style> =>
      style !== false && style != null && style !== ""
  );

  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return filtered as StyleProp<T>;
}

/**
 * Combine style utilities for View / Pressable / ScrollView.
 * Filters out falsy values, making it safe to use conditional styles inline.
 *
 * @example
 * <View style={view(styles.flex1, styles.p4, isActive && styles.bgPrimary)} />
 */
export function view(
  ...styles: (StyleProp<ViewStyle> | Falsy)[]
): StyleProp<ViewStyle> {
  return filterStyles(styles);
}

/**
 * Combine style utilities for Text.
 * Automatically applies the default font family (Plus Jakarta Sans).
 * Filters out falsy values for safe conditional styling.
 *
 * @example
 * <Text style={text(styles.textLg, styles.fontBold, styles.textForeground, styles.mb2)} />
 */
export function text(
  ...styles: (StyleProp<TextStyle> | Falsy)[]
): StyleProp<TextStyle> {
  return filterStyles([{ fontFamily: fontFamily.sans }, ...styles]);
}

/** @deprecated Use `view` instead — alias for backward compatibility */
export const vx = view;

/**
 * Create dynamic spacing styles from numeric values.
 * Useful when spacing needs to be computed at runtime rather than using static tokens.
 *
 * @param type - Spacing type: p/padding, m/margin, px/py/pt/pr/pb/pl, mx/my/mt/mr/mb/ml
 * @param value - The spacing value in pixels
 *
 * @example
 * <View style={view(styles.p4, space('p', 6))} />
 */
export function space(
  type:
    | "p"
    | "m"
    | "px"
    | "py"
    | "pt"
    | "pr"
    | "pb"
    | "pl"
    | "mx"
    | "my"
    | "mt"
    | "mr"
    | "mb"
    | "ml",
  value: number
): ViewStyle & TextStyle {
  const map: Record<string, keyof (ViewStyle & TextStyle)> = {
    p: "padding",
    m: "margin",
    px: "paddingHorizontal",
    py: "paddingVertical",
    pt: "paddingTop",
    pr: "paddingRight",
    pb: "paddingBottom",
    pl: "paddingLeft",
    mx: "marginHorizontal",
    my: "marginVertical",
    mt: "marginTop",
    mr: "marginRight",
    mb: "marginBottom",
    ml: "marginLeft",
  };

  return { [map[type]]: value };
}
