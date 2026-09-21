import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { text, useStyles, view } from "@/styles";

import { UtilityChip } from "./UtilityChip";

type Props = {
  title: string;
  description?: string;
  utilities?: string[];
  children: ReactNode;
};

export function Section({ title, description, utilities, children }: Props) {
  const styles = useStyles();

  return (
    <View style={view(styles.mb8)}>
      <Text
        style={text(
          styles.textLg,
          styles.fontSemiBold,
          styles.textForeground,
          styles.mb1,
        )}
      >
        {title}
      </Text>
      {description ? (
        <Text style={text(styles.textSm, styles.textMuted, styles.mb3)}>
          {description}
        </Text>
      ) : null}
      {utilities && utilities.length > 0 ? (
        <View
          style={view(styles.flexRow, styles.flexWrap, styles.gap1, styles.mb3)}
        >
          {utilities.map((name) => (
            <UtilityChip key={name} name={name} />
          ))}
        </View>
      ) : null}
      {children}
    </View>
  );
}
