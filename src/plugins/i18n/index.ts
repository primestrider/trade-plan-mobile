import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  defaultNamespace,
  fallbackLanguage,
  isSupportedLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from "../../../configs/i18n.config";
import { resources, type TranslationResource } from "@/locales";
import { setActiveLanguage } from "@/shared/helpers/locale";
import { mmkvStorage, storageKeys } from "@/plugins/mmkv";

/**
 * Resolves the language to start with: an explicit user choice wins,
 * then the device language, then the fallback.
 */
function resolveInitialLanguage(): SupportedLanguage {
  const stored = mmkvStorage.getString(storageKeys.app.language);
  if (isSupportedLanguage(stored)) return stored;

  const deviceLanguage = getLocales()[0]?.languageCode;
  if (isSupportedLanguage(deviceLanguage)) return deviceLanguage;

  return fallbackLanguage;
}

const initialLanguage = resolveInitialLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: fallbackLanguage,
  supportedLngs: [...supportedLanguages],
  defaultNS: defaultNamespace,
  ns: [defaultNamespace],
  interpolation: {
    // React already escapes interpolated values.
    escapeValue: false,
  },
  returnNull: false,
});

setActiveLanguage(initialLanguage);

// Keep the persisted preference and the formatting helpers in sync.
i18n.on("languageChanged", (language) => {
  if (!isSupportedLanguage(language)) return;

  mmkvStorage.set(storageKeys.app.language, language);
  setActiveLanguage(language);
});

/**
 * Switches the app language and persists the choice.
 *
 * @example
 * await changeLanguage('id');
 */
export async function changeLanguage(
  language: SupportedLanguage,
): Promise<void> {
  await i18n.changeLanguage(language);
}

/** The language currently rendered by the app. */
export function getCurrentLanguage(): SupportedLanguage {
  return isSupportedLanguage(i18n.language) ? i18n.language : fallbackLanguage;
}

export default i18n;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNamespace;
    resources: TranslationResource;
    returnNull: false;
  }
}
