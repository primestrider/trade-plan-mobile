import type { ReactNode } from "react";
import { View } from "react-native";

import { AppText, Screen } from "@/shared/components";
import { useStyles, view } from "@/styles";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ExampleScreen({ title, subtitle, children }: Readonly<Props>) {
  const styles = useStyles();

  return (
    <Screen>
      <View style={view(styles.mb6)}>
        <AppText variant="h2">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color="muted" style={styles.mt1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {children}
    </Screen>
  );
}
