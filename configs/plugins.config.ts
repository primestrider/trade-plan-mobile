import { ExpoConfig } from "expo/config";

import { fontPlugin } from "./font.config";
import { localesPlugin } from "./locales.config";

export const plugins: NonNullable<ExpoConfig["plugins"]> = [
  "expo-router",

  // Required as of SDK 57 — these packages ship config plugins that must be
  // registered explicitly for native autolinking.
  "expo-image",
  "expo-status-bar",
  "expo-web-browser",

  [
    "expo-splash-screen",
    {
      backgroundColor: "#208AEF",
      android: {
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    },
  ],

  fontPlugin as [string, any],
  localesPlugin as [string, any],
];
