import onboarding from "@/features/onboarding/languages/onboarding.en";
import utils from "@/shared/languages/utils.en";

/**
 * English translations — the reference shape every other language follows.
 *
 * This file only assembles; the copy itself lives next to the code that uses
 * it. `common` is the i18next namespace (see `configs/i18n.config.ts`), so a
 * key reads as `utils.action.save` or `features.onboarding.title`.
 */
export const en = {
  common: {
    features: {
      onboarding,
    },
    utils,
  },
};
