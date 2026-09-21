import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { selectIsAuthenticated, useSessionStore } from "@/features/auth";
import { ExamplePageName, type ExampleHref } from "@/features/example/models";
import { examplePaths, featureScreens } from "@/features/example/routes";
import { AppText, Badge, Card, Screen } from "@/shared/components";
import { useStyles, view } from "@/styles";

export default function FeaturesIndex() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useSessionStore(selectIsAuthenticated);

  /**
   * `/sign-in` disappears from the navigator once the user is signed in, so a
   * signed-in tap on that card must land on `/account` instead — the only
   * route the guard leaves standing for that session.
   */
  const hrefFor = (screen: (typeof featureScreens)[number]): ExampleHref =>
    screen.name === ExamplePageName.SIGN_IN
      ? isAuthenticated
        ? examplePaths.account
        : examplePaths.signIn
      : screen.href;

  return (
    <>
      <Stack.Screen options={{ title: t("features.example.title") }} />
      <Screen contentContainerStyle={styles.gap3}>
        <AppText variant="h2">{t("features.example.title")}</AppText>
        <AppText variant="caption" color="muted" style={styles.mb3}>
          {t("features.example.subtitle")}
        </AppText>

        {featureScreens.map((screen) => (
          <Card
            key={screen.name}
            variant="outlined"
            onPress={() => router.push(hrefFor(screen))}
          >
            <Card.Header
              title={t(screen.titleKey)}
              subtitle={t(screen.descriptionKey)}
            />
            <Card.Body>
              <View style={view(styles.flexRow, styles.flexWrap, styles.gap1)}>
                {screen.plugins.map((plugin) => (
                  <Badge key={plugin} label={plugin} size="sm" variant="outline" />
                ))}
              </View>
            </Card.Body>
          </Card>
        ))}
      </Screen>
    </>
  );
}
