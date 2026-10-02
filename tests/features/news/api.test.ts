import axios from "axios";

import { fetchNews, NEWS_FEEDS } from "@/features/news/services/api";

import { antaraXml, cnbcXml } from "./fixtures";

jest.mock("axios", () => ({ get: jest.fn() }));

const mockGet = jest.mocked(axios.get);

beforeEach(() => mockGet.mockReset());

it("merges every feed, newest first", async () => {
  mockGet.mockImplementation(async (url: string) => {
    if (url === NEWS_FEEDS[0].url) return { data: cnbcXml };
    if (url === NEWS_FEEDS[2].url) return { data: antaraXml };
    return { data: "<rss></rss>" };
  });

  const news = await fetchNews();

  expect(news.map((item) => item.source)).toEqual(["ANTARA", "CNBC Indonesia"]);
});

it("still shows the feeds that answered when one fails", async () => {
  mockGet.mockImplementation(async (url: string) => {
    if (url === NEWS_FEEDS[0].url) return { data: cnbcXml };
    throw new Error("timeout");
  });

  await expect(fetchNews()).resolves.toHaveLength(1);
});

it("fails only when no feed can be read", async () => {
  mockGet.mockRejectedValue(new Error("offline"));

  await expect(fetchNews()).rejects.toThrow("offline");
});
