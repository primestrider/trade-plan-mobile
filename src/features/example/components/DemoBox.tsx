import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Text, View } from "react-native";

import { text, useStyles, view } from "@/styles";

type Props = {
  label?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function DemoBox({ label, style, children }: Readonly<Props>) {
  const styles = useStyles();

  return (
    <View
      style={view(
        styles.bgSecondary,
        styles.border,
        styles.borderBorder,
        styles.roundedLg,
        styles.p3,
        style,
      )}
    >
      {label ? (
        <Text
          style={text(
            styles.textXs,
            styles.textMuted,
            styles.mb2,
            styles.fontMono,
          )}
        >
          {label}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
