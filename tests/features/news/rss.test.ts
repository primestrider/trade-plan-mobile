import { codesIn, parsePubDate, parseRss } from "@/features/news/helpers/rss";

import { antaraXml, cnbcXml } from "./fixtures";

describe("reading a feed", () => {
  it("takes the headline, link, date, lead and image of each item", () => {
    expect(parseRss(cnbcXml, "CNBC Indonesia")).toEqual([
      {
        id: "https://www.cnbcindonesia.com/market/1/bbca-naik",
        link: "https://www.cnbcindonesia.com/market/1/bbca-naik",
        title: "BBCA Naik, Asing Borong Saham Bank",
        source: "CNBC Indonesia",
        publishedAt: "2026-10-02T12:05:45.000Z",
        summary: "Saham BBCA & bank besar menguat.",
        image: "https://img.example/bbca.jpeg?w=1200&q=90",
        codes: [],
      },
    ]);
  });

  it("skips an item without a headline", () => {
    expect(parseRss(antaraXml, "ANTARA").map((item) => item.link)).toEqual([
      "https://www.antaranews.com/berita/2/ihsg",
    ]);
  });

  it("reads RFC 822 dates with their offset, and gives up on anything else", () => {
    expect(parsePubDate("Fri, 02 Oct 2026 21:31:00 +0700")).toBe(
      "2026-10-02T14:31:00.000Z",
    );
    expect(parsePubDate("Thu, 01 Oct 2026 08:00:00 GMT")).toBe(
      "2026-10-01T08:00:00.000Z",
    );
    expect(parsePubDate("kemarin")).toBeNull();
  });
});

describe("finding stock codes in a headline", () => {
  const listed = new Set(["BUMI", "TLKM", "BBCA"]);

  it("counts only all-caps listed codes, once each", () => {
    expect(
      codesIn("Bumi Resources: BUMI dan TLKM Bergerak, IHSG dan BUMI Menguat", listed),
    ).toEqual(["BUMI", "TLKM"]);
  });
});
