import { z } from "zod";

import { translationKey } from "@/shared/models/i18n";

/**
 * What the onboarding form accepts before it reaches the profile store.
 *
 * `balance` is validated as a *string*, not a number: it comes straight from a
 * `TextInput`, and parsing it here would hide the difference between "not
 * filled in yet" and "zero". The screen converts once, after validation has
 * guaranteed the text is digits.
 *
 * Rupiah is written without decimals (see `formatCurrency`), so a decimal
 * point is rejected rather than rounded — the one stray character that can
 * survive `Input type="currency"`, which otherwise strips non-digits.
 */
const WHOLE_RUPIAH = /^\d+$/;

export const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, translationKey("features.onboarding.validation.nameMin"))
    .max(50, translationKey("features.onboarding.validation.nameMax")),

  balance: z
    .string()
    .min(1, translationKey("features.onboarding.validation.balanceRequired"))
    .regex(
      WHOLE_RUPIAH,
      translationKey("features.onboarding.validation.balanceInvalid"),
    )
    .refine(
      (balance) => Number(balance) > 0,
      translationKey("features.onboarding.validation.balanceMin"),
    ),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
