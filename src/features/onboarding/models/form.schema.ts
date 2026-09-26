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
 * point is rejected rather than rounded. `Input type="currency"` already hands
 * over bare digits; the check keeps the store safe from any other caller.
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
