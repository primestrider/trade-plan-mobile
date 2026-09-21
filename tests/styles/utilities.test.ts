import { styles } from "@/styles";
import {
  fontFamily,
  fontSize,
  lineHeight,
  radii,
  spacing,
  type SpacingToken,
} from "@/styles/tokens";

const spacingTokens = Object.keys(spacing) as unknown as SpacingToken[];

describe("spacing utilities", () => {
  it("generates every axis for every spacing token", () => {
    const missing = spacingTokens.flatMap((token) =>
      ["p", "px", "py", "pt", "pr", "pb", "pl", "m", "mx", "my", "mt", "mr", "mb", "ml"]
        .map((prefix) => `${prefix}${token}`)
        .filter((key) => styles[key as keyof typeof styles] === undefined),
    );

    expect(missing).toEqual([]);
  });

  it("maps shorthands to the right properties", () => {
    expect(styles.p4).toEqual({ padding: spacing[4] });
    expect(styles.px3).toEqual({ paddingHorizontal: spacing[3] });
    expect(styles.mt2).toEqual({ marginTop: spacing[2] });
    expect(styles["mb1.5"]).toEqual({ marginBottom: spacing[1.5] });
  });

  it("negates margins and skips the zero token", () => {
    expect(styles["-mt2"]).toEqual({ marginTop: -spacing[2] });
    expect(styles["-m0" as keyof typeof styles]).toBeUndefined();
  });

  it("derives gaps from the same scale", () => {
    expect(styles.gap3).toEqual({ gap: spacing[3] });
  });
});

describe("sizing utilities", () => {
  it("generates width, height, and square sizes per token", () => {
    expect(styles.w4).toEqual({ width: spacing[4] });
    expect(styles.h12).toEqual({ height: spacing[12] });
    expect(styles.size16).toEqual({ width: spacing[16], height: spacing[16] });
  });

  it("exposes fractional and full sizes", () => {
    expect(styles.wFull).toEqual({ width: "100%" });
    expect(styles.wHalf).toEqual({ width: "50%" });
    expect(styles.aspectSquare).toEqual({ aspectRatio: 1 });
  });
});

describe("typography utilities", () => {
  it("pairs each text size with its line height", () => {
    expect(styles.textLg).toEqual({
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
    });
  });

  it("expresses weight through weight-specific font families", () => {
    expect(styles.fontMedium).toEqual({ fontFamily: fontFamily.medium });
    expect(styles.fontBold).toEqual({ fontFamily: fontFamily.bold });
    expect(styles.fontExtraBold).toEqual({ fontFamily: fontFamily.extrabold });
  });

  it("defines a font family for every weight token", () => {
    for (const family of Object.values(fontFamily)) {
      expect(typeof family).toBe("string");
      expect(family).not.toBe("");
    }
  });
});

describe("appearance utilities", () => {
  // Semantic colors depend on the active theme, so they deliberately live on
  // `useStyles()` only. Keeping them off the static object is what stops a
  // surface from being silently pinned to light mode — see theme.test.ts.
  it.each([
    "bgBackground",
    "bgPrimary",
    "bgCard",
    "textForeground",
    "textMuted",
    "borderBorder",
  ])("does not expose the theme-dependent %s statically", (key) => {
    expect(styles[key as keyof typeof styles]).toBeUndefined();
  });

  it("generates palette shades", () => {
    expect(styles.bgGray100).toBeDefined();
    expect(styles.textPrimary500).toBeDefined();
    expect(styles.bgWhite).toEqual({ backgroundColor: "#FFFFFF" });
  });

  it("maps radii tokens", () => {
    expect(styles.rounded).toEqual({ borderRadius: radii.DEFAULT });
    expect(styles.roundedLg).toEqual({ borderRadius: radii.lg });
    expect(styles.roundedFull).toEqual({ borderRadius: radii.full });
  });

  it("keeps border width and opacity scales", () => {
    expect(styles.border).toEqual({ borderWidth: 1 });
    expect(styles.opacity75).toEqual({ opacity: 0.75 });
  });
});

describe("utility keys used by the example screens", () => {
  // Theme-neutral utilities the shipped example screens reference. A rename
  // that drops one should fail here, not at runtime. Semantic color keys are
  // covered in theme.test.ts, since they only exist on `useStyles()`.
  const usedKeys = [
    "flex1",
    "flexRow",
    "itemsCenter",
    "justifyCenter",
    "justifyBetween",
    "center",
    "flexWrap",
    "wFull",
    "bgGray100",
    "bgAmber100",
    "textWhite",
    "textAmber900",
    "textSuccess700",
    "border",
    "rounded",
    "roundedLg",
    "roundedXl",
    "shadow",
    "shadowMd",
    "opacity75",
    "textXs",
    "textSm",
    "textBase",
    "textLg",
    "textXl",
    "text2xl",
    "text3xl",
    "fontMono",
    "fontMedium",
    "fontSemiBold",
    "fontBold",
    "fontExtraBold",
    "textCenter",
    "p2",
    "p3",
    "p4",
    "p6",
    "px4",
    "px6",
    "py3",
    "py4",
    "mb1",
    "mb2",
    "mb3",
    "mb4",
    "mb6",
    "mb8",
    "mt2",
    "mt3",
    "mr2",
    "ml2",
    "gap2",
    "gap3",
    "gap4",
    "mb1.5",
    "mt1.5",
  ] as const;

  it.each(usedKeys)("%s exists", (key) => {
    expect(styles[key as keyof typeof styles]).toBeDefined();
  });
});
