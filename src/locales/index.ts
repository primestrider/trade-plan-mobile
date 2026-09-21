import type { SupportedLanguage } from "../../configs/i18n.config";
import { en } from "./en";
import { id } from "./id";

/** Translation resources in the shape i18next expects: language → namespace. */
export const resources: Record<SupportedLanguage, typeof en> = { en, id };

/** Shape of a single language's translations, used for typed keys. */
export type TranslationResource = typeof en;

export { en, id };
