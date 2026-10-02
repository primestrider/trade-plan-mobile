import googleSheets from "@/features/google-sheets/languages/google-sheets.id";
import home from "@/features/home/languages/home.id";
import news from "@/features/news/languages/news.id";
import onboarding from "@/features/onboarding/languages/onboarding.id";
import profile from "@/features/profile/languages/profile.id";
import search from "@/features/search/languages/search.id";
import settings from "@/features/settings/languages/settings.id";
import tradeLog from "@/features/trade-log/languages/trade-log.id";
import utils from "@/shared/languages/utils.id";

import type { en } from "./en";

/** Indonesian translations — typed against `en` so missing keys fail the build. */
export const id: typeof en = {
  common: {
    features: {
      googleSheets,
      home,
      news,
      onboarding,
      profile,
      search,
      settings,
      tradeLog,
    },
    utils,
  },
};
