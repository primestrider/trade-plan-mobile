import axios from "axios";

import { parseRss } from "../helpers/rss";
import type { NewsFeed, NewsItem } from "../models/news";

/**
 * The market sections of three Indonesian publishers. Only the headline,
 * a short lead and the link are shown; the article itself opens on the
 * publisher's site.
 */
export const NEWS_FEEDS: readonly NewsFeed[] = [
  { source: "CNBC Indonesia", url: "https://www.cnbcindonesia.com/market/rss" },
  { source: "IDX Channel", url: "https://www.idxchannel.com/rss" },
  { source: "ANTARA", url: "https://www.antaranews.com/rss/ekonomi-bursa.xml" },
];

/** Enough for a day or two of market news without a long scroll. */
const MAX_ITEMS = 60;

/**
 * Fetch the latest market headlines from every feed, newest first.
 *
 * Read straight from the publishers rather than through our API, so plain
 * `axios` is used instead of the app instance (which points at our backend).
 * One feed failing does not hide the others; only when all fail is it an
 * error. Browsers block these cross-origin reads, so on web this needs a
 * backend route in front of the feeds.
 *
 * @returns {Promise<NewsItem[]>} Headlines across feeds, deduplicated by link
 */
export const fetchNews = async (): Promise<NewsItem[]> => {
  const results = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => {
      const { data } = await axios.get<string>(feed.url, {
        responseType: "text",
        timeout: 10_000,
      });

      return parseRss(data, feed.source);
    }),
  );

  const fulfilled = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );

  if (fulfilled.length === 0) {
    const firstError = results.find((result) => result.status === "rejected");
    throw firstError?.status === "rejected"
      ? firstError.reason
      : new Error("No news feed could be read");
  }

  const byLink = new Map<string, NewsItem>();
  for (const item of fulfilled.flat()) {
    if (!byLink.has(item.link)) byLink.set(item.link, item);
  }

  return [...byLink.values()]
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .slice(0, MAX_ITEMS);
};
