import { supportedLanguages } from "./i18n.config";

/**
 * Declares the languages the native app advertises to iOS and Android.
 * Derived from `i18n.config.ts` so the native and runtime language lists
 * can never drift apart.
 */
export const localesPlugin = [
  "expo-localization",
  {
    supportedLocales: {
      ios: [...supportedLanguages],
      android: [...supportedLanguages],
    },
  },
] as const;
