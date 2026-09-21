import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { AppText, Screen } from "@/shared/components";
import { useStyles } from "@/styles";

/**
 * The one screen behind the guard.
 *
 * Signing out does not navigate: clearing the session removes this route from
 * the navigator, and the user is carried out by the guard.
 */
export default function AccountScreen() {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{ title: t("features.example.signIn.account.title") }}
      />
      <Screen>
        <AppText variant="h2">
          {t("features.example.signIn.account.title")}
        </AppText>
        <AppText variant="caption" color="muted" style={styles.mb6}>
          {t("features.example.signIn.account.subtitle")}
        </AppText>
      </Screen>
    </>
  );
}
