import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { Stock } from "@/features/search/models/api.model";
import { fetchStocks } from "@/features/search/services/api";
import { usePlanStore } from "@/features/trade-log/stores/plan.store";
import type { ApiError } from "@/shared/models";

import { codesIn } from "../helpers/rss";
import type { NewsItem } from "../models/news";
import { fetchNews } from "../services/api";

export type TaggedNews = NewsItem & {
  /** True when the headline names a stock in one of the user's live plans. */
  aboutPlans: boolean;
};

/**
 * Market headlines, each tagged with the stock codes it names and whether
 * any of them is in a live plan — the news a trader most needs to see.
 *
 * Codes are matched against the exchange's list (shared with search, so it
 * is usually cached already); until it arrives, headlines show untagged.
 */
export function useNews() {
  const news = useQuery<NewsItem[], Error>({
    queryKey: ["news"],
    queryFn: fetchNews,
  });

  const { data: stocks } = useQuery<Stock[], ApiError>({
    queryKey: ["stocks", "list"],
    queryFn: fetchStocks,
  });

  const plans = usePlanStore((state) => state.plans);

  const items = useMemo<TaggedNews[]>(() => {
    const listed = new Set(stocks?.map((stock) => stock.Code));
    const planned = new Set(
      plans.filter((plan) => plan.status !== "closed").map((plan) => plan.code),
    );

    return (news.data ?? []).map((item) => {
      const codes = codesIn(item.title, listed);

      return {
        ...item,
        codes,
        aboutPlans: codes.some((code) => planned.has(code)),
      };
    });
  }, [news.data, stocks, plans]);

  return { ...news, items };
}
