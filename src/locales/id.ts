import home from "@/features/home/languages/home.id";
import onboarding from "@/features/onboarding/languages/onboarding.id";
import search from "@/features/search/languages/search.id";
import tradeLog from "@/features/trade-log/languages/trade-log.id";
import utils from "@/shared/languages/utils.id";

import type { en } from "./en";

/** Indonesian translations — typed against `en` so missing keys fail the build. */
export const id: typeof en = {
  common: {
    features: {
      home,
      onboarding,
      search,
      tradeLog,
    },
    utils,
  },
};
