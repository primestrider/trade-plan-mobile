import type { ExpoConfig } from "expo/config";

import packageJson from "../package.json";

/**
 * Each slot is 1000 wide, not 100: the deployment bumps patch on nearly
 * every merge to `main`, so a three-digit patch is not a theoretical case.
 * Under the old multipliers 1.0.100 and 1.1.0 both produce 10100 —
 * versionCode stops increasing monotonically and the Play Store rejects the
 * next upload.
 */
function getVersionCode(version: string): number {
  const [major, minor, patch] = version.split(".").map(Number);

  return major * 1_000_000 + minor * 1_000 + patch;
}

export const androidConfig: ExpoConfig["android"] = {
  package: "com.primestrider.rnexpoboilerplate",

  versionCode: getVersionCode(packageJson.version),

  adaptiveIcon: {
    backgroundColor: "#E6F4FE",
    foregroundImage: "./assets/images/android-icon-foreground.png",
    backgroundImage: "./assets/images/android-icon-background.png",
    monochromeImage: "./assets/images/android-icon-monochrome.png",
  },

  predictiveBackGestureEnabled: false,
};
