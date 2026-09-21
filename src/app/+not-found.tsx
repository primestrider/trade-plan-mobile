import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { Button, Card, EmptyState, Screen } from "@/shared/components";
import { useStyles } from "@/styles";

/**
 * Where an unknown deep link lands.
 *
 * Unlike `AppErrorBoundary`, this renders inside the layout, so the providers
 * are all present and `useTranslation` is safe here.
 */
export default function NotFoundScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("utils.fallback.notFoundTitle") }} />
      <Screen>
        <Card variant="outlined" style={styles.mt6}>
          <EmptyState
            title={t("utils.fallback.notFoundTitle")}
            description={t("utils.fallback.notFoundDescription")}
            action={
              <Button
                title={t("utils.action.goHome")}
                onPress={() => router.replace("/")}
              />
            }
          />
        </Card>
      </Screen>
    </>
  );
}
