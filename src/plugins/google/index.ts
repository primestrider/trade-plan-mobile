import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";

/**
 * Lets the app create and write the one spreadsheet it makes, and nothing
 * else in the user's Drive. Google classes it as non-sensitive, so the app
 * needs no verification review to request it.
 */
export const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || null;

/**
 * Whether this build carries Google client IDs. Without them the Google
 * Sheets section says so instead of offering a sign-in that cannot work.
 */
export const isGoogleConfigured = webClientId !== "";

let configured = false;

/**
 * Configures the SDK on first use rather than on import, so a build without
 * client IDs (or a test) never touches the native module.
 */
export function ensureGoogleConfigured() {
  if (configured || !isGoogleConfigured) return;

  GoogleOneTapSignIn.configure({
    webClientId,
    iosClientId,
    scopes: [DRIVE_FILE_SCOPE],
  });
  configured = true;
}
