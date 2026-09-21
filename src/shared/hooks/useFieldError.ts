import { useTranslation } from "react-i18next";

import type { TranslationKey } from "@/shared/models/i18n";

/**
 * Turns a React Hook Form error into display text.
 *
 * Schemas store translation keys rather than sentences, so an error follows a
 * language switch. React Hook Form types `message` as a plain `string`, which
 * is why the narrowing happens here — once, behind a named boundary — instead
 * of as a bare cast in every form.
 *
 * @example
 * const fieldError = useFieldError();
 * <Input error={fieldError(errors.username?.message)} />
 */
export function useFieldError() {
  const { t } = useTranslation();

  return (message?: string): string | undefined =>
    message ? t(message as TranslationKey) : undefined;
}
