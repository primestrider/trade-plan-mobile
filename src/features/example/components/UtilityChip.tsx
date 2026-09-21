import { Text, View } from "react-native";

import { text, useStyles, view } from "@/styles";

type Props = {
  name: string;
};

export function UtilityChip({ name }: Props) {
  const styles = useStyles();

  return (
    <View
      style={view(styles.bgSecondary, styles.px2, styles.py1, styles.rounded)}
    >
      <Text style={text(styles.textXs, styles.fontMono, styles.textSecondary)}>
        {name}
      </Text>
    </View>
  );
}
