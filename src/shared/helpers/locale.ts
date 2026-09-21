import type { Locale } from "date-fns";
import { enUS, id as idID } from "date-fns/locale";

import {
  fallbackLanguage,
  isSupportedLanguage,
  localeTags,
  type SupportedLanguage,
} from "../../../configs/i18n.config";

/**
 * Active language used by the formatting and parsing helpers.
 *
 * Kept as module state rather than React state so non-component code
 * (interceptors, stores, utilities) can format values without a hook.
 * `@/plugins/i18n` keeps this in sync with i18next.
 */
let activeLanguage: SupportedLanguage = fallbackLanguage;

const dateLocales: Record<SupportedLanguage, Locale> = {
  en: enUS,
  id: idID,
};

/**
 * Sets the language used by every helper that formats or parses
 * locale-sensitive values. Unsupported values are ignored.
 *
 * @example
 * setActiveLanguage('id');
 */
export function setActiveLanguage(language: string): void {
  if (isSupportedLanguage(language)) {
    activeLanguage = language;
  }
}

/** The language currently used for formatting and parsing. */
export function getActiveLanguage(): SupportedLanguage {
  return activeLanguage;
}

/**
 * BCP-47 tag for the `Intl` APIs.
 *
 * @example
 * new Intl.NumberFormat(getIntlLocale()).format(1234); // '1,234' | '1.234'
 */
export function getIntlLocale(
  language: SupportedLanguage = activeLanguage,
): string {
  return localeTags[language];
}

/** `date-fns` locale object matching the given (or active) language. */
export function getDateLocale(
  language: SupportedLanguage = activeLanguage,
): Locale {
  return dateLocales[language];
}
