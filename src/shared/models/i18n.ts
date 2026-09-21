import type { ParseKeys } from "i18next";

/**
 * Every key the loaded translations actually define.
 *
 * `t()` accepts only these, so a typo is a compile error rather than a dotted
 * path rendered to the user.
 */
export type TranslationKey = ParseKeys;

/**
 * Marks a string as a translation key, checked where it is written.
 *
 * Some APIs type their message slot as a plain `string` — zod's validation
 * messages, route metadata — but we store keys there so the text can follow
 * the active language. Wrapping the literal validates it against the real
 * bundle; without it a typo would only surface on screen.
 *
 * This module deliberately holds no runtime i18n import: a schema that pulled
 * in `@/plugins/i18n` would drag MMKV and `expo-localization` into every
 * module that validates a form.
 *
 * @example
 * z.string().min(3, translationKey("features.example.signIn.validation.usernameMin"))
 */
export function translationKey(key: TranslationKey): TranslationKey {
  return key;
}
