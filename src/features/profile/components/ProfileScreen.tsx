import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { GoogleSheetsSection } from "@/features/google-sheets/components/GoogleSheetsSection";
import {
  formatPercentValue,
  formatRupiah,
} from "@/features/trade-log/helpers/format";
import { AppText, Avatar, ListItem, Screen } from "@/shared/components";
import { useProfileStore } from "@/shared/stores";
import { useStyles, view } from "@/styles";

/**
 * Who the plan belongs to, and the account it is copied to.
 *
 * The capital and risk are shown here for reference and lead to where they
 * are changed; the Google connection is the one thing set up on this page.
 */
export function ProfileScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const name = useProfileStore((state) => state.name);
  const balance = useProfileStore((state) => state.balance);
  const riskPercent = useProfileStore((state) => state.riskPercent);

  return (
    <>
      <Stack.Screen options={{ title: t("features.profile.title") }} />

      <Screen>
        <View style={view(styles.itemsCenter, styles.gap3, styles.mt4)}>
          <Avatar name={name} size="xl" />
          <AppText variant="h3">{name}</AppText>
        </View>

        <View style={styles.mt8}>
          <ListItem
            title={t("features.profile.capital")}
            right={<AppText variant="label">{formatRupiah(balance)}</AppText>}
          />
          <ListItem
            title={t("features.profile.risk")}
            right={
              <AppText variant="label">{formatPercentValue(riskPercent)}</AppText>
            }
            showChevron
            onPress={() => router.push("/settings")}
          />
          <ListItem
            title={t("features.profile.settings")}
            showChevron
            onPress={() => router.push("/settings")}
          />
        </View>

        <View style={styles.mt10}>
          <GoogleSheetsSection />
        </View>
      </Screen>
    </>
  );
}
