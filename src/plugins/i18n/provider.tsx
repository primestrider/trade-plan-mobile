import type { PropsWithChildren } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from ".";

/**
 * Provides the i18next instance to the component tree.
 * Enables `useTranslation()` and re-renders every consumer on language change.
 */
export function AppI18nProvider({ children }: Readonly<PropsWithChildren>) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
