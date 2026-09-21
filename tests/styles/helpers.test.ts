import { StyleSheet } from "react-native";

import { gridCol, space, styles, text, view } from "@/styles";
import { fontFamily, spacing } from "@/styles/tokens";

describe("view", () => {
  it("returns undefined when nothing is passed", () => {
    expect(view()).toBeUndefined();
  });

  it("returns the single style as-is", () => {
    expect(view(styles.flex1)).toBe(styles.flex1);
  });

  it("keeps multiple styles for React Native to merge", () => {
    expect(StyleSheet.flatten(view(styles.flex1, styles.p4))).toEqual({
      flex: 1,
      padding: spacing[4],
    });
  });

  it.each([
    ["false", false],
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
  ])("drops %s so conditional styles are safe", (_label, falsy) => {
    expect(view(styles.flex1, falsy as false)).toBe(styles.flex1);
  });

  it("returns undefined when every style is falsy", () => {
    expect(view(false, null, undefined, "")).toBeUndefined();
  });

  it("lets a later style win over an earlier one", () => {
    const flattened = StyleSheet.flatten(view(styles.p2, styles.p4));

    expect(flattened.padding).toBe(spacing[4]);
  });
});

describe("text", () => {
  it("applies the default font family", () => {
    expect(StyleSheet.flatten(text())).toEqual({ fontFamily: fontFamily.sans });
  });

  it("lets an explicit weight override the default family", () => {
    const flattened = StyleSheet.flatten(text(styles.fontBold));

    expect(flattened.fontFamily).toBe(fontFamily.bold);
  });

  it("merges the default family with other text styles", () => {
    const flattened = StyleSheet.flatten(text(styles.textLg, styles.textCenter));

    expect(flattened).toMatchObject({
      fontFamily: fontFamily.sans,
      textAlign: "center",
    });
  });

  it("drops falsy values like view does", () => {
    const flattened = StyleSheet.flatten(text(false && styles.textLg));

    expect(flattened).toEqual({ fontFamily: fontFamily.sans });
  });
});

describe("space", () => {
  it.each([
    ["p", "padding"],
    ["m", "margin"],
    ["px", "paddingHorizontal"],
    ["py", "paddingVertical"],
    ["pt", "paddingTop"],
    ["pr", "paddingRight"],
    ["pb", "paddingBottom"],
    ["pl", "paddingLeft"],
    ["mx", "marginHorizontal"],
    ["my", "marginVertical"],
    ["mt", "marginTop"],
    ["mr", "marginRight"],
    ["mb", "marginBottom"],
    ["ml", "marginLeft"],
  ])("maps %s to %s", (shorthand, property) => {
    expect(space(shorthand as "p", 20)).toEqual({ [property]: 20 });
  });

  it("accepts runtime values a static token cannot express", () => {
    expect(space("p", 13.5)).toEqual({ padding: 13.5 });
  });
});

describe("gridCol", () => {
  it.each([
    [1, 100],
    [2, 50],
    [4, 25],
    [5, 20],
  ])("gives each of %s columns %s%% width", (cols, expected) => {
    expect(gridCol(cols as 1)).toEqual({ width: `${expected}%` });
  });

  it("divides evenly for counts that do not round", () => {
    const width = gridCol(3).width as string;

    expect(width.endsWith("%")).toBe(true);
    expect(Number.parseFloat(width)).toBeCloseTo(100 / 3, 5);
  });

  it.each([1, 2, 3, 4, 5, 6])("%s columns fill a whole row", (cols) => {
    const width = Number.parseFloat(gridCol(cols as 1).width as string);

    expect(width * cols).toBeCloseTo(100, 5);
  });
});
