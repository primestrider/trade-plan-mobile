import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Button, EmptyState, Screen } from "@/shared/components";
import { useStyles, view } from "@/styles";

/**
 * Where the trades a user plans and takes will be recorded.
 *
 * Nothing is recorded yet, so the screen is its own empty state, pointing at
 * the one place a trade can start from: finding the stock. The route hides its
 * header, so the top inset is claimed here, as on the home screen.
 */
export function TradeLogScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView
      edges={["top"]}
      style={view(styles.flex1, styles.bgBackground)}
    >
      <Screen>
        <AppText variant="h3">{t("features.tradeLog.title")}</AppText>

        <EmptyState
          style={styles.mt8}
          title={t("features.tradeLog.empty.title")}
          description={t("features.tradeLog.empty.description")}
          action={
            <Button
              title={t("features.tradeLog.empty.action")}
              variant="secondary"
              onPress={() => router.push("/search")}
            />
          }
        />
      </Screen>
    </SafeAreaView>
  );
}
