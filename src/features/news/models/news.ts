/** One headline from a market news feed. */
export type NewsItem = {
  /** The article URL, which also identifies it across feeds. */
  id: string;
  title: string;
  link: string;
  /** The publisher's name as shown to the user, e.g. `CNBC Indonesia`. */
  source: string;
  /** ISO timestamp, or `null` when the feed's date could not be read. */
  publishedAt: string | null;
  /** Plain-text lead, without markup. May be empty. */
  summary: string;
  image: string | null;
  /** Stock codes named in the headline, e.g. `["BBCA"]`. */
  codes: string[];
};

export type NewsFeed = { source: string; url: string };
