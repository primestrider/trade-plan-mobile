import googleSheets from "@/features/google-sheets/languages/google-sheets.en";
import home from "@/features/home/languages/home.en";
import news from "@/features/news/languages/news.en";
import onboarding from "@/features/onboarding/languages/onboarding.en";
import profile from "@/features/profile/languages/profile.en";
import search from "@/features/search/languages/search.en";
import settings from "@/features/settings/languages/settings.en";
import tradeLog from "@/features/trade-log/languages/trade-log.en";
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
