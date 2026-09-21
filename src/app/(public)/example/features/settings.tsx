import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import {
  languageNames,
  supportedLanguages,
  type SupportedLanguage,
} from "../../../../../configs/i18n.config";
import { useSettingsStore } from "@/features/example/stores/settings.store";
import { changeLanguage, getCurrentLanguage } from "@/plugins/i18n";
import {
  AppText,
  Card,
  Divider,
  Screen,
  Select,
  Switch,
  ThemeToggle,
} from "@/shared/components";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
} from "@/shared/helpers";
import { useStyles, view } from "@/styles";

/** A fixed moment, so the preview shows formatting rather than the clock. */
const SAMPLE_DATE = "2026-09-18T14:30:00.000Z";
const SAMPLE_NUMBER = 1234567.891;

export default function SettingsScreen() {
  const styles = useStyles();
  const { t, i18n } = useTranslation();

  const pushEnabled = useSettingsStore((state) => state.pushEnabled);
  const emailDigest = useSettingsStore((state) => state.emailDigest);
  const setPushEnabled = useSettingsStore((state) => state.setPushEnabled);
  const setEmailDigest = useSettingsStore((state) => state.setEmailDigest);

  // Read through i18n.language so the row re-renders when the language changes.
  const language = (i18n.language as SupportedLanguage) ?? getCurrentLanguage();

  const preview = [
    { label: t("features.example.settings.formatting.number"), value: formatNumber(SAMPLE_NUMBER) },
    {
      label: t("features.example.settings.formatting.currency"),
      value: formatCurrency(SAMPLE_NUMBER),
    },
    { label: t("features.example.settings.formatting.date"), value: formatDateTime(SAMPLE_DATE) },
    {
      label: t("features.example.settings.formatting.relative"),
      value: formatRelativeTime(SAMPLE_DATE),
    },
  ];

  return (
    <>
      <Stack.Screen options={{ title: t("features.example.settings.title") }} />
      <Screen contentContainerStyle={styles.gap5}>
        <View>
          <AppText variant="h2">{t("features.example.settings.title")}</AppText>
          <AppText variant="caption" color="muted" style={styles.mt1}>
            {t("features.example.settings.subtitle")}
          </AppText>
        </View>

        <Card variant="outlined">
          <Card.Header title={t("features.example.settings.appearance.title")} />
          <Card.Body>
            <AppText variant="caption" color="muted" style={styles.mb2}>
              {t("features.example.settings.appearance.theme")}
            </AppText>
            <ThemeToggle />
          </Card.Body>
        </Card>

        <Card variant="outlined">
          <Card.Header title={t("features.example.settings.language.title")} />
          <Card.Body>
            <Select
              label={t("features.example.settings.language.label")}
              value={language}
              onChange={(next) => changeLanguage(next)}
              options={supportedLanguages.map((code) => ({
                value: code,
                label: languageNames[code],
              }))}
            />
          </Card.Body>
        </Card>

        <Card variant="outlined">
          <Card.Header title={t("features.example.settings.notifications.title")} />
          <Card.Body>
            <View style={view(styles.gap4)}>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                label={t("features.example.settings.notifications.push")}
                description={t("features.example.settings.notifications.pushDescription")}
              />
              <Divider />
              <Switch
                value={emailDigest}
                onValueChange={setEmailDigest}
                label={t("features.example.settings.notifications.email")}
                description={t("features.example.settings.notifications.emailDescription")}
              />
            </View>
          </Card.Body>
        </Card>

        <Card variant="filled">
          <Card.Header
            title={t("features.example.settings.formatting.title")}
            subtitle={t("features.example.settings.formatting.description")}
          />
          <Card.Body>
            <View style={view(styles.gap3)}>
              {preview.map((row) => (
                <View
                  key={row.label}
                  style={view(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.gap3)}
                >
                  <AppText variant="caption" color="muted">
                    {row.label}
                  </AppText>
                  <AppText variant="mono" numberOfLines={1}>
                    {row.value}
                  </AppText>
                </View>
              ))}
            </View>
          </Card.Body>
        </Card>
      </Screen>
    </>
  );
}
