import { Stack, useRouter } from "expo-router";
import { View } from "react-native";

import { exampleScreens } from "@/features/example/routes";
import { AppText, Badge, Card, Screen } from "@/shared/components";
import { useStyles, view } from "@/styles";

export default function ExampleIndex() {
  const styles = useStyles();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Style Examples" }} />
      <Screen contentContainerStyle={styles.gap3}>
        <AppText variant="h2">Utility Styling</AppText>
        <AppText variant="caption" color="muted" style={styles.mb3}>
          Collection of examples showcasing all utility classes. Tailwind-like
          styling using React Native&apos;s built-in StyleSheet.
        </AppText>

        {exampleScreens.map((screen) => (
          <Card
            key={screen.title}
            variant="outlined"
            onPress={() => router.push(screen.href)}
          >
            <Card.Header title={screen.title} subtitle={screen.description} />
            <Card.Body>
              <View style={view(styles.flexRow, styles.flexWrap, styles.gap1)}>
                {screen.utilities.map((utility) => (
                  <Badge key={utility} label={utility} size="sm" variant="outline" />
                ))}
              </View>
            </Card.Body>
          </Card>
        ))}
      </Screen>
    </>
  );
}
