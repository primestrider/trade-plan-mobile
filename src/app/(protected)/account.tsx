import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { selectFullName, useSessionStore } from "@/features/auth";
import { AppText, Avatar, Button, Card, Screen } from "@/shared/components";
import { useStyles, view } from "@/styles";

/**
 * The one screen behind the guard.
 *
 * Signing out does not navigate: clearing the session removes this route from
 * the navigator, and the user is carried out by the guard.
 */
export default function AccountScreen() {
  const styles = useStyles();
  const { t } = useTranslation();

  const user = useSessionStore((state) => state.user);
  const fullName = useSessionStore(selectFullName);
  const signOut = useSessionStore((state) => state.signOut);

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

        {user ? (
          <Card variant="outlined">
            <View style={view(styles.flexRow, styles.itemsCenter, styles.gap3)}>
              <Avatar source={user.image} name={fullName} size="lg" status="online" />
              <View style={view(styles.flex1, styles.gap1, { minWidth: 0 })}>
                <AppText variant="caption" color="muted">
                  {t("features.example.signIn.session.title")}
                </AppText>
                <AppText variant="title" numberOfLines={1}>
                  {fullName}
                </AppText>
                <AppText variant="caption" color="muted" numberOfLines={1}>
                  {user.email}
                </AppText>
              </View>
            </View>

            <Card.Footer style={styles.mt4}>
              <Button
                title={t("features.example.signIn.action.signOut")}
                variant="outline"
                onPress={() => signOut("user")}
              />
            </Card.Footer>

            <AppText variant="caption" color="muted" style={styles.mt3}>
              {t("features.example.signIn.session.tokenNote")}
            </AppText>
          </Card>
        ) : null}
      </Screen>
    </>
  );
}
