import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import {
  GOOGLE_SIGN_IN_BUTTON_HEIGHT,
  GoogleSignInButton,
} from "react-native-nitro-google-signin";

import { isGoogleConfigured } from "@/plugins/google";
import {
  AppText,
  Avatar,
  Button,
  Dialog,
  ListItem,
  useToast,
} from "@/shared/components";
import { formatRelativeTime } from "@/shared/helpers";
import { text, useStyles, useTheme, view } from "@/styles";

import { connectGoogle, disconnectGoogle, syncNow } from "../services/sync";
import { selectSpreadsheet, useSheetStore } from "../stores/sheet.store";

/**
 * The trade log's connection to Google Sheets: the official sign-in button
 * while disconnected; once connected, the account, the spreadsheet, how the
 * last sync went, and the way out.
 *
 * Sync is one way, app to sheet, and the section says so up front: an edit
 * made in the log tab is overwritten on the next change.
 */
export function GoogleSheetsSection() {
  const styles = useStyles();
  const { t } = useTranslation();
  const account = useSheetStore((state) => state.account);

  return (
    <View>
      <AppText variant="title">{t("features.googleSheets.title")}</AppText>
      <AppText color="muted" style={text(styles.mt1)}>
        {isGoogleConfigured
          ? t(
              account
                ? "features.googleSheets.howItWorks"
                : "features.googleSheets.description",
            )
          : t("features.googleSheets.notConfigured")}
      </AppText>

      {isGoogleConfigured ? (
        account ? (
          <Connected />
        ) : (
          <ConnectButton />
        )
      ) : null}
    </View>
  );
}

function ConnectButton() {
  const styles = useStyles();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    setLoading(true);
    try {
      if ((await connectGoogle()) === "cancelled") {
        toast.show({ title: t("features.googleSheets.cancelled") });
      }
    } catch {
      toast.error(t("features.googleSheets.connectFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleSignInButton
      testID="google-sign-in"
      colorScheme={isDark ? "dark" : "light"}
      size="wide"
      signInBehavior="none"
      onPress={connect}
      loading={loading}
      disabled={loading}
      style={view(styles.mt4, { height: GOOGLE_SIGN_IN_BUTTON_HEIGHT })}
    />
  );
}

function Connected() {
  const styles = useStyles();
  const { t } = useTranslation();
  const account = useSheetStore((state) => state.account);
  const spreadsheet = useSheetStore(selectSpreadsheet);
  const syncing = useSheetStore((state) => state.syncing);
  const error = useSheetStore((state) => state.error);
  const lastSyncedAt = useSheetStore((state) => state.lastSyncedAt);
  const rejections = useSheetStore((state) => state.rejections);
  const [confirming, setConfirming] = useState(false);

  if (!account) return null;

  const status = syncing
    ? t("features.googleSheets.syncing")
    : lastSyncedAt
      ? t("features.googleSheets.syncedAt", {
          time: formatRelativeTime(lastSyncedAt),
        })
      : t("features.googleSheets.notSynced");

  const disconnect = async () => {
    setConfirming(false);
    await disconnectGoogle().catch(() => undefined);
  };

  return (
    <View style={styles.mt4}>
      <View style={view(styles.flexRow, styles.itemsCenter, styles.gap3)}>
        <Avatar
          name={account.name ?? account.email ?? "?"}
          source={account.photo ?? undefined}
          size="md"
        />
        <View style={styles.flex1}>
          {account.name ? <AppText weight="semibold">{account.name}</AppText> : null}
          {account.email ? (
            <AppText variant="caption" color="muted">
              {account.email}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={styles.mt3}>
        {spreadsheet ? (
          <ListItem
            title={t("features.googleSheets.open")}
            subtitle={status}
            showChevron
            onPress={() => Linking.openURL(spreadsheet.spreadsheetUrl)}
          />
        ) : (
          <ListItem title={status} />
        )}
      </View>

      {error ? (
        <AppText color={error === "reconnect" ? "destructive" : "warning"} style={text(styles.mt2)}>
          {t(`features.googleSheets.error.${error}`)}
        </AppText>
      ) : null}
      {/* Access ended (revoked in the Google account, or expired): signing
          in again restores it without losing the spreadsheet. */}
      {error === "reconnect" ? <ConnectButton /> : null}

      {rejections.length > 0 ? (
        <View style={view(styles.mt3, styles.gap1)}>
          <AppText color="warning" weight="semibold">
            {t("features.googleSheets.rejected.title")}
          </AppText>
          {rejections.map((rejection) => (
            <AppText key={rejection.row} variant="caption" color="muted">
              {t("features.googleSheets.rejected.row", {
                row: rejection.row,
                code: rejection.code || "-",
                reason: t(`features.googleSheets.rejected.reason.${rejection.reason}`),
              })}
            </AppText>
          ))}
        </View>
      ) : null}

      <View style={view(styles.gap2, styles.mt4)}>
        <Button
          variant="secondary"
          title={t("features.googleSheets.syncNow")}
          loading={syncing}
          onPress={() => void syncNow()}
        />
        <Button
          variant="ghost"
          title={t("features.googleSheets.disconnect")}
          onPress={() => setConfirming(true)}
        />
      </View>

      <Dialog visible={confirming} onClose={() => setConfirming(false)}>
        <Dialog.Title>
          {t("features.googleSheets.disconnectDialog.title")}
        </Dialog.Title>
        <Dialog.Body>{t("features.googleSheets.disconnectDialog.body")}</Dialog.Body>
        <Dialog.Actions>
          <Button
            variant="ghost"
            title={t("utils.action.cancel")}
            onPress={() => setConfirming(false)}
          />
          <Button
            variant="destructive"
            title={t("features.googleSheets.disconnectDialog.action")}
            onPress={disconnect}
          />
        </Dialog.Actions>
      </Dialog>
    </View>
  );
}
