import type { ErrorBoundaryProps } from "expo-router";
import { ScrollView, View } from "react-native";

import i18n from "@/plugins/i18n";
import { useStyles, view } from "@/styles";

import { AppText } from "./AppText";
import { Button } from "./Button";

/**
 * What replaces a screen that threw.
 *
 * Expo Router wraps the route component itself, and a layout passes its
 * boundary down to the screens beneath it. A screen that throws renders this
 * inside the layout, with every provider in place — but when the root layout
 * itself throws, this replaces the layout, and `AppProvider` is gone with it.
 *
 * That is why nothing here may call `useTranslation` or `useToast`. `i18n.t`
 * reads the same bundle without needing a React provider, and `useStyles`
 * comes from Zustand, which needs none either.
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const styles = useStyles();

  return (
    <View
      style={view(
        styles.flex1,
        styles.bgBackground,
        styles.p6,
        styles.justifyCenter,
        styles.gap4,
      )}
    >
      <AppText variant="h2">{i18n.t("utils.fallback.errorTitle")}</AppText>
      <AppText variant="caption" color="muted">
        {i18n.t("utils.fallback.errorDescription")}
      </AppText>

      {__DEV__ ? (
        <ScrollView
          style={view(styles.maxH40, styles.bgSecondary, styles.roundedLg, styles.p3)}
        >
          <AppText variant="mono" color="muted">
            {error.message}
          </AppText>
        </ScrollView>
      ) : null}

      <Button title={i18n.t("utils.action.retry")} onPress={retry} block />
    </View>
  );
}
