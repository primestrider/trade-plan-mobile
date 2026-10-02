import type { ExpoConfig } from "expo/config";

/**
 * Google Sign-In, used to write the trade log to the user's Google Sheets.
 *
 * Client IDs are public identifiers, not secrets, so they travel in the
 * `EXPO_PUBLIC_` env like the API URL. See `docs/google-sheets-setup.md`.
 *
 * Android needs no plugin: the Web client ID is passed to `configure()` at
 * runtime and the SDK is autolinked. iOS needs the plugin to register the
 * OAuth redirect URL scheme (the reversed iOS client ID), and the plugin
 * refuses to run without one, so it is added only when an iOS client ID is
 * set — an Android-only build stays buildable with the iOS ID left empty.
 */
export function googleSignInPlugin(): NonNullable<ExpoConfig["plugins"]>[number] | null {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  if (!iosClientId) return null;

  const reversed = iosClientId.split(".").reverse().join(".");

  return ["react-native-nitro-google-signin", { iosUrlScheme: reversed }];
}
