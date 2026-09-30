import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/styles";

/**
 * The bottom menu, drawn by the platform's own tab bar: home on the left,
 * stock search in the middle, the trade log on the right.
 *
 * Icons only — each label is hidden rather than left out, so it is still what
 * a screen reader announces for the tab.
 *
 * Native tabs mount every tab up front, so no tab may do anything on mount
 * that the user would notice while looking at another (search does not
 * autofocus its field for this reason).
 */
export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <NativeTabs
      backgroundColor={colors.card}
      iconColor={colors.muted}
      tintColor={colors.primary}
      indicatorColor={colors.secondary}
      labelVisibilityMode="unlabeled"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
        <NativeTabs.Trigger.Label hidden>
          {t("utils.navigation.home")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label hidden>
          {t("utils.navigation.searchStock")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="trade-log">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "list.bullet.clipboard",
            selected: "list.bullet.clipboard.fill",
          }}
          md="receipt_long"
        />
        <NativeTabs.Trigger.Label hidden>
          {t("utils.navigation.tradeLog")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
