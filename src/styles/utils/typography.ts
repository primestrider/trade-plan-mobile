import { StyleSheet } from "react-native";

import { fontFamily, fontSize, letterSpacing, lineHeight } from "../tokens";

export const typography = StyleSheet.create({
  // Font Family
  fontSans: { fontFamily: fontFamily.sans },
  fontMono: { fontFamily: fontFamily.mono },

  // Font Size + Line Height
  textXs: { fontSize: fontSize.xs, lineHeight: lineHeight.xs },
  textSm: { fontSize: fontSize.sm, lineHeight: lineHeight.sm },
  textBase: { fontSize: fontSize.base, lineHeight: lineHeight.base },
  textLg: { fontSize: fontSize.lg, lineHeight: lineHeight.lg },
  textXl: { fontSize: fontSize.xl, lineHeight: lineHeight.xl },
  text2xl: { fontSize: fontSize["2xl"], lineHeight: lineHeight["2xl"] },
  text3xl: { fontSize: fontSize["3xl"], lineHeight: lineHeight["3xl"] },
  text4xl: { fontSize: fontSize["4xl"], lineHeight: lineHeight["4xl"] },
  text5xl: { fontSize: fontSize["5xl"], lineHeight: lineHeight["5xl"] },
  text6xl: { fontSize: fontSize["6xl"], lineHeight: lineHeight["6xl"] },

  // Font Weight — uses weight-specific font families for real bold glyphs
  fontNormal: { fontFamily: fontFamily.sans },
  fontMedium: { fontFamily: fontFamily.medium },
  fontSemiBold: { fontFamily: fontFamily.semibold },
  fontBold: { fontFamily: fontFamily.bold },
  fontExtraBold: { fontFamily: fontFamily.extrabold },

  // Letter Spacing
  trackingTighter: { letterSpacing: letterSpacing.tighter },
  trackingTight: { letterSpacing: letterSpacing.tight },
  trackingNormal: { letterSpacing: letterSpacing.normal },
  trackingWide: { letterSpacing: letterSpacing.wide },
  trackingWider: { letterSpacing: letterSpacing.wider },
  trackingWidest: { letterSpacing: letterSpacing.widest },

  // Text Align
  textLeft: { textAlign: "left" },
  textCenter: { textAlign: "center" },
  textRight: { textAlign: "right" },
  textJustify: { textAlign: "justify" },

  // Text Decoration
  underline: { textDecorationLine: "underline" },
  lineThrough: { textDecorationLine: "line-through" },
  noUnderline: { textDecorationLine: "none" },

  // Text Transform
  uppercase: { textTransform: "uppercase" },
  lowercase: { textTransform: "lowercase" },
  capitalize: { textTransform: "capitalize" },
  normalCase: { textTransform: "none" },

  // Vertical Align (for inline Text)
  alignTop: { verticalAlign: "top" },
  alignMiddle: { verticalAlign: "middle" },
  alignBottom: { verticalAlign: "bottom" },

  // Truncate
  truncate: {
    overflow: "hidden",
  },
});
