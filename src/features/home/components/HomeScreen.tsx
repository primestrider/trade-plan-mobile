import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeNews } from "@/features/news/components/HomeNews";
import { ActivePlans } from "@/features/trade-log/components/ActivePlans";
import { useEffectiveRisk } from "@/features/trade-log/hooks/useEffectiveRisk";
import {
  formatPercentValue,
  formatRupiah,
} from "@/features/trade-log/helpers/format";
import { AppText, Avatar, IconButton, Screen } from "@/shared/components";
import { formatCurrency, formatNumber } from "@/shared/helpers";
import { maxLossPerTrade, useProfileStore } from "@/shared/stores";
import { text, useStyles, useTheme, view } from "@/styles";
import { fontSize, letterSpacing } from "@/styles/tokens";
import { fontFamily } from "@/styles/tokens/typography";

import { EditBalanceSheet } from "./EditBalanceSheet";

/**
 * Where the user lands once onboarding has stored their profile.
 *
 * The header answers the two things a trader opens the app to check: whose
 * plan this is, and the capital it is measured against. The balance is set on
 * the bare background rather than in a card, so it reads as the page's
 * headline instead of one tile among many.
 *
 * Beneath it, what that capital means for the next trade (the loss limit set
 * in settings), then the live plans from the trade log and the market news.
 */
export function HomeScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const name = useProfileStore((state) => state.name);
  const balance = useProfileStore((state) => state.balance);
  const risk = useEffectiveRisk();
  const router = useRouter();
  const [isEditingBalance, setIsEditingBalance] = useState(false);

  // Rupiah is grouped the Indonesian way everywhere, matching onboarding.
  const digits = formatNumber(balance, {
    language: "id",
    maximumFractionDigits: 0,
  });

  // The route hides its header, so the top inset is claimed here; `Screen`
  // already owns the bottom one.
  return (
    <SafeAreaView
      edges={["top"]}
      style={view(styles.flex1, styles.bgBackground)}
    >
      <Screen>
        <View style={view(styles.flexRow, styles.itemsCenter, styles.gap3)}>
          <AppText variant="h3" numberOfLines={1} style={styles.flex1}>
            {t("features.home.greeting", { name })}
          </AppText>
          <IconButton
            variant="secondary"
            accessibilityLabel={t("features.home.openSettings")}
            onPress={() => router.push("/settings")}
            icon={
              <SymbolView
                name={{ ios: "gearshape", android: "settings", web: "settings" }}
                tintColor={colors.foreground}
                size={20}
              />
            }
          />
          <Pressable
            onPress={() => router.push("/profile")}
            accessibilityRole="button"
            accessibilityLabel={t("features.profile.open")}
            hitSlop={4}
            style={({ pressed }) => pressed && { opacity: 0.6 }}
          >
            <Avatar name={name} size="md" />
          </Pressable>
        </View>

        {/* Read as one amount by screen readers; the split below is visual.
            The whole block is the tap target, so the edit is easy to reach. */}
        <Pressable
          onPress={() => setIsEditingBalance(true)}
          accessibilityRole="button"
          accessibilityHint={t("features.home.editBalance.hint")}
          accessibilityLabel={`${t("features.home.balance")}, ${formatCurrency(
            balance,
            { language: "id" },
          )}`}
          style={({ pressed }) =>
            view(
              styles.mt8,
              styles.pb6,
              styles.borderB,
              styles.borderBorder,
              pressed && { opacity: 0.6 },
            )
          }
        >
          <View
            style={view(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyBetween,
              styles.mb1,
            )}
          >
            <AppText color="muted">{t("features.home.balance")}</AppText>
            <AppText variant="label" color="primary">
              {t("features.home.editBalance.action")}
            </AppText>
          </View>

          {/* The currency sits small and raised against the digits, so the
              number itself carries the weight. */}
          <View style={view(styles.flexRow, styles.itemsStart)}>
            <AppText
              variant="title"
              color="muted"
              style={{ marginTop: 3, marginRight: 4 }}
            >
              Rp
            </AppText>
            <AppText
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                flexShrink: 1,
                fontSize: fontSize["4xl"],
                lineHeight: fontSize["4xl"] * 1.1,
                fontFamily: fontFamily.extrabold,
                letterSpacing: letterSpacing.tighter,
                fontVariant: ["tabular-nums"],
                color: colors.foreground,
              }}
            >
              {digits}
            </AppText>
          </View>
        </Pressable>

        {/* What the capital means for the next trade. Tapping it opens the
            setting the amount comes from. */}
        <Pressable
          onPress={() => router.push("/settings")}
          accessibilityRole="button"
          accessibilityHint={t("features.home.risk.hint")}
          style={({ pressed }) =>
            view(
              styles.py6,
              styles.borderB,
              styles.borderBorder,
              pressed && { opacity: 0.6 },
            )
          }
        >
          <View
            style={view(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyBetween,
              styles.mb1,
            )}
          >
            <AppText color="muted">{t("features.home.risk.label")}</AppText>
            <AppText variant="label" color="primary">
              {t("features.home.risk.action")}
            </AppText>
          </View>
          <AppText
            variant="h2"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {formatRupiah(maxLossPerTrade(balance, risk.percent))}
          </AppText>
          <AppText color="muted" style={text(styles.mt2)}>
            {t("features.home.risk.description", {
              percent: formatPercentValue(risk.percent),
            })}
          </AppText>
          {risk.lowered ? (
            <AppText color="warning" style={text(styles.mt2)}>
              {t("features.tradeLog.performance.streakGuarded", {
                percent: formatPercentValue(risk.percent),
              })}
            </AppText>
          ) : null}
        </Pressable>

        <ActivePlans />

        <HomeNews />
      </Screen>

      <EditBalanceSheet
        visible={isEditingBalance}
        onClose={() => setIsEditingBalance(false)}
      />
    </SafeAreaView>
  );
}
