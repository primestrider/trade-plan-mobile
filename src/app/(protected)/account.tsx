import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

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
      <Stack.Screen options={{ title: "Account" }} />
    </>
  );
}
