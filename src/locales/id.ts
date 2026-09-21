import onboarding from "@/features/onboarding/languages/onboarding.id";
import utils from "@/shared/languages/utils.id";

import type { en } from "./en";

/** Indonesian translations — typed against `en` so missing keys fail the build. */
export const id: typeof en = {
  common: {
    features: {
      onboarding,
    },
    utils,
  },
};
