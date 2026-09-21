import type { TextStyle, ViewStyle } from "react-native";

import type { SpacingToken } from "./tokens";
import type { appearance } from "./utils/appearance";
import type { grid, layout } from "./utils/layout";
import type { sizing } from "./utils/sizing";
import type { typography } from "./utils/typography";

/** Margin & padding — valid di View maupun Text */
export type SpacingStyle = Pick<
  ViewStyle & TextStyle,
  | "margin"
  | "marginHorizontal"
  | "marginVertical"
  | "marginTop"
  | "marginRight"
  | "marginBottom"
  | "marginLeft"
  | "padding"
  | "paddingHorizontal"
  | "paddingVertical"
  | "paddingTop"
  | "paddingRight"
  | "paddingBottom"
  | "paddingLeft"
>;

type AxisSpacing<P extends "p" | "m"> = {
  [K in SpacingToken as `${P}${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `${P}x${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `${P}y${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `${P}t${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `${P}r${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `${P}b${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `${P}l${K}`]: SpacingStyle;
};

type NegativeMarginUtilities = {
  [K in SpacingToken as `-m${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `-mx${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `-my${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `-mt${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `-mr${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `-mb${K}`]: SpacingStyle;
} & {
  [K in SpacingToken as `-ml${K}`]: SpacingStyle;
};

type GapUtilities = {
  [K in SpacingToken as `gap${K}`]: Pick<ViewStyle, "gap">;
};

type FixedSizeUtilities = {
  [K in SpacingToken as `w${K}`]: Pick<ViewStyle, "width">;
} & {
  [K in SpacingToken as `h${K}`]: Pick<ViewStyle, "height">;
} & {
  [K in SpacingToken as `size${K}`]: Pick<ViewStyle, "width" | "height">;
} & {
  [K in SpacingToken as `minW${K}`]: Pick<ViewStyle, "minWidth">;
} & {
  [K in SpacingToken as `minH${K}`]: Pick<ViewStyle, "minHeight">;
} & {
  [K in SpacingToken as `maxW${K}`]: Pick<ViewStyle, "maxWidth">;
} & {
  [K in SpacingToken as `maxH${K}`]: Pick<ViewStyle, "maxHeight">;
};

type ColorFamily = "primary" | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose" | "slate" | "gray" | "zinc" | "neutral" | "stone" | "taupe" | "mauve" | "mist" | "olive" | "success" | "warning" | "error" | "info";

type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

type SimpleColor = "white" | "black" | "transparent";

type ColorUtilities<Prefix extends string, Prop extends keyof (ViewStyle & TextStyle)> = {
  [F in ColorFamily as `${Prefix}${Capitalize<F & string>}${ColorShade}`]: Pick<ViewStyle & TextStyle, Prop>;
} & {
  [S in SimpleColor as `${Prefix}${Capitalize<S & string>}`]: Pick<ViewStyle & TextStyle, Prop>;
};

type BgColorUtilities = ColorUtilities<"bg", "backgroundColor">;
type TextColorUtilities = ColorUtilities<"text", "color">;
type BorderColorUtilities = ColorUtilities<"border", "borderColor">;

export type Utilities = typeof layout &
  typeof grid &
  typeof sizing &
  typeof typography &
  typeof appearance &
  AxisSpacing<"p"> &
  AxisSpacing<"m"> &
  NegativeMarginUtilities &
  GapUtilities &
  FixedSizeUtilities &
  BgColorUtilities &
  TextColorUtilities &
  BorderColorUtilities;
