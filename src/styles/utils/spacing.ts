import { StyleSheet } from "react-native";

import { spacing } from "../tokens";

type SpacingStyle = Record<string, Record<string, number>>;

/**
 * Generate padding or margin utilities for all spacing tokens.
 * Creates entries like `p4`, `px4`, `pt4` and `m4`, `mx4`, `mt4` for every token value.
 */
function buildSpacingUtilities(
  prefix: "p" | "m",
  property: "padding" | "margin"
): SpacingStyle {
  const styles: SpacingStyle = {};

  for (const [key, value] of Object.entries(spacing)) {
    const suffix = key === "DEFAULT" ? "" : key;
    styles[`${prefix}${suffix}`] = { [property]: value };
    styles[`${prefix}x${suffix}`] = {
      [`${property}Horizontal`]: value,
    };
    styles[`${prefix}y${suffix}`] = {
      [`${property}Vertical`]: value,
    };
    styles[`${prefix}t${suffix}`] = { [`${property}Top`]: value };
    styles[`${prefix}r${suffix}`] = { [`${property}Right`]: value };
    styles[`${prefix}b${suffix}`] = { [`${property}Bottom`]: value };
    styles[`${prefix}l${suffix}`] = { [`${property}Left`]: value };
  }

  return styles;
}

export const padding = StyleSheet.create(
  buildSpacingUtilities("p", "padding") as Parameters<typeof StyleSheet.create>[0]
);

export const margin = StyleSheet.create(
  buildSpacingUtilities("m", "margin") as Parameters<typeof StyleSheet.create>[0]
);

/** Negative margin utilities — prefixes: -m, -mx, -my, -mt, -mr, -mb, -ml */
export const negativeMargin = StyleSheet.create(
  Object.fromEntries(
    Object.entries(spacing)
      .filter(([, value]) => value > 0)
      .flatMap(([key, value]) => [
        [`-m${key}`, { margin: -value }],
        [`-mx${key}`, { marginHorizontal: -value }],
        [`-my${key}`, { marginVertical: -value }],
        [`-mt${key}`, { marginTop: -value }],
        [`-mr${key}`, { marginRight: -value }],
        [`-mb${key}`, { marginBottom: -value }],
        [`-ml${key}`, { marginLeft: -value }],
      ])
  ) as Parameters<typeof StyleSheet.create>[0]
);
