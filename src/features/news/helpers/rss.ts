import type { NewsItem } from "../models/news";

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/**
 * Reads an RSS date such as `Fri, 02 Oct 2026 19:05:45 +0700`.
 *
 * Parsed by hand: `Date.parse` on Hermes does not reliably accept the
 * RFC 822 form every feed here uses.
 */
export function parsePubDate(value: string): string | null {
  const match = value
    .trim()
    .match(/(\d{1,2}) (\w{3}) (\d{4}) (\d{2}):(\d{2})(?::(\d{2}))? ?([+-]\d{4}|GMT|UTC|Z)?/);

  if (!match) return null;

  const [, day, mon, year, hh, mm, ss = "0", zone = "+0000"] = match;
  const month = MONTHS[mon];

  if (month === undefined) return null;

  const offsetMinutes = /^[+-]\d{4}$/.test(zone)
    ? (zone.startsWith("-") ? -1 : 1) *
      (Number(zone.slice(1, 3)) * 60 + Number(zone.slice(3, 5)))
    : 0;

  const utc =
    Date.UTC(+year, month, +day, +hh, +mm, +ss) - offsetMinutes * 60_000;

  return new Date(utc).toISOString();
}

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|\w+);/gi, (whole, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) {
      return String.fromCodePoint(parseInt(code.slice(2), 16));
    }
    if (code.startsWith("#")) return String.fromCodePoint(Number(code.slice(1)));

    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

/** The text of one tag, CDATA unwrapped and entities decoded. */
function tag(xml: string, name: string): string {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));

  if (!match) return "";

  const raw = match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

  return decodeEntities(raw).trim();
}

/** Turns an HTML fragment into one line of plain text. */
function plainText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function imageOf(item: string, description: string): string | null {
  const url =
    item.match(/<enclosure[^>]*url="([^"]+)"/i)?.[1] ??
    item.match(/<media:content[^>]*url="([^"]+)"/i)?.[1] ??
    description.match(/<img[^>]*src="([^"]+)"/i)?.[1];

  return url ? decodeEntities(url) : null;
}

/**
 * Reads the items out of an RSS 2.0 document.
 *
 * A small purpose-built reader rather than an XML library: the three feeds
 * the app uses are plain RSS, and every field taken here is a flat tag. An
 * item without a title or link is skipped rather than shown half-empty.
 */
export function parseRss(xml: string, source: string): NewsItem[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];

  return items.flatMap((item) => {
    const title = plainText(tag(item, "title"));
    const link = tag(item, "link") || tag(item, "guid");

    if (!title || !/^https?:\/\//.test(link)) return [];

    const description = tag(item, "description");

    return [
      {
        id: link,
        title,
        link,
        source,
        publishedAt: parsePubDate(tag(item, "pubDate")),
        summary: plainText(description),
        image: imageOf(item, description),
        codes: [],
      },
    ];
  });
}

/**
 * Finds the stock codes a headline names. Headlines are written in title
 * case, so only an all-caps four-letter word that is a listed code counts —
 * "Bumi" in a sentence is not BUMI the stock.
 */
export function codesIn(title: string, listed: ReadonlySet<string>): string[] {
  const words = title.match(/\b[A-Z]{4}\b/g) ?? [];

  return [...new Set(words.filter((word) => listed.has(word)))];
}
