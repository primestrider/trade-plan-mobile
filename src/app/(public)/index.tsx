import { useRouter } from "expo-router";
import { View } from "react-native";

import { AppText, Screen } from "@/shared/components";
import { useStyles, view } from "@/styles";

export default function Index() {
  const styles = useStyles();
  const router = useRouter();

  return (
    <Screen scroll={false} padded={false}>
      <View style={view(styles.flex1, styles.p6, styles.center, styles.gap3)}>
        <AppText variant="h1" align="center">
          RN Expo Boilerplate
        </AppText>
        <AppText
          variant="caption"
          color="muted"
          align="center"
          style={styles.mb6}
        >
          Tailwind-like utility styling with React Native&apos;s built-in
          StyleSheet
        </AppText>
      </View>
    </Screen>
  );
}
