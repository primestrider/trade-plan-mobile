/**
 * Shared internationalization configuration.
 *
 * This module is intentionally free of React Native and Expo imports so it can
 * be consumed from two places at once:
 * - build time, by `app.config.ts` via `locales.config.ts`
 * - runtime, by `@/plugins/i18n` and the shared formatting helpers
 */

/** Every language the app ships translations for. */
export const supportedLanguages = ["en", "id"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

/** Used when the device language has no translation available. */
export const fallbackLanguage: SupportedLanguage = "en";

/** Single translation namespace — add more here when the app grows. */
export const defaultNamespace = "common";

/** BCP-47 tags used by `Intl` and `date-fns` for each supported language. */
export const localeTags: Record<SupportedLanguage, string> = {
  en: "en-US",
  id: "id-ID",
};

/** Native display names, ready for a language switcher. */
export const languageNames: Record<SupportedLanguage, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

/**
 * Narrows an unknown value (stored preference, device locale, i18next event)
 * to a language the app actually supports.
 */
export function isSupportedLanguage(
  value: unknown,
): value is SupportedLanguage {
  return (
    typeof value === "string" &&
    (supportedLanguages as readonly string[]).includes(value)
  );
}
