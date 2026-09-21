import { StyleSheet, View, type ViewProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";

import { AppText } from "./AppText";

type DividerOrientation = "horizontal" | "vertical";

export type DividerProps = ViewProps & {
  orientation?: DividerOrientation;
  /** Horizontal inset in px, for a rule that stops short of the container edge. */
  inset?: number;
  /** Centers a caption in the rule — horizontal only. */
  label?: string;
};

/**
 * Hairline rule between sections or rows.
 *
 * Thickness is `StyleSheet.hairlineWidth` — the platform's own separator
 * weight, so it matches native lists rather than sitting a pixel heavier.
 *
 * @example
 * <Divider />
 * <Divider inset={16} />
 * <Divider label="or" />
 */
export function Divider({
  orientation = "horizontal",
  inset = 0,
  label,
  style,
  ...rest
}: Readonly<DividerProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  // `alignSelf: stretch` rather than `width: 100%`, so an inset shortens the
  // rule instead of pushing it past the container edge.
  const rule = {
    backgroundColor: colors.border,
    alignSelf: "stretch" as const,
    ...(orientation === "horizontal"
      ? { height: StyleSheet.hairlineWidth }
      : { width: StyleSheet.hairlineWidth }),
  };

  if (label && orientation === "horizontal") {
    return (
      <View
        accessibilityRole="none"
        style={[
          view(styles.flexRow, styles.itemsCenter, styles.gap3, {
            marginHorizontal: inset,
          }),
          style,
        ]}
        {...rest}
      >
        <View
          style={view(styles.flex1, {
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
          })}
        />
        <AppText variant="caption" color="muted">
          {label}
        </AppText>
        <View
          style={view(styles.flex1, {
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
          })}
        />
      </View>
    );
  }

  return (
    <View
      accessibilityRole="none"
      style={[
        view(
          rule,
          orientation === "horizontal"
            ? { marginHorizontal: inset }
            : { marginVertical: inset },
        ),
        style,
      ]}
      {...rest}
    />
  );
}
