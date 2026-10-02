import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import * as WebBrowser from "expo-web-browser";

import { NewsScreen } from "@/features/news/components/NewsScreen";
import { parseRss } from "@/features/news/helpers/rss";
import { fetchNews } from "@/features/news/services/api";
import { fetchStocks } from "@/features/search/services/api";
import { usePlanStore } from "@/features/trade-log/stores/plan.store";
import { changeLanguage } from "@/plugins/i18n";

import { bbca, stockLike } from "../search/fixtures";
import { antaraXml, cnbcXml } from "./fixtures";

jest.mock("@/features/news/services/api", () => ({
  ...jest.requireActual("@/features/news/services/api"),
  fetchNews: jest.fn(),
}));
jest.mock("@/features/search/services/api", () => ({ fetchStocks: jest.fn() }));
jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn() }));
jest.mock("expo-router", () => ({ Stack: { Screen: () => null } }));

const news = [
  ...parseRss(antaraXml, "ANTARA"),
  ...parseRss(cnbcXml, "CNBC Indonesia"),
];

beforeAll(async () => {
  await changeLanguage("id");
});

beforeEach(() => {
  jest.mocked(fetchNews).mockResolvedValue(news);
  jest.mocked(fetchStocks).mockResolvedValue([
    bbca,
    stockLike("TLKM", "Telkom Indonesia (Persero) Tbk."),
  ]);
  act(() => usePlanStore.setState({ plans: [] }));
});

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <NewsScreen />
    </QueryClientProvider>,
  );
}

it("lists headlines with the stock codes they name", async () => {
  renderScreen();

  expect(
    await screen.findByText("BBCA Naik, Asing Borong Saham Bank"),
  ).toBeOnTheScreen();
  expect(await screen.findByText("TLKM")).toBeOnTheScreen();
});

it("opens the article on the publisher's site", async () => {
  renderScreen();

  fireEvent.press(await screen.findByText("BBCA Naik, Asing Borong Saham Bank"));

  expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
    "https://www.cnbcindonesia.com/market/1/bbca-naik",
  );
});

it("narrows to stocks in the user's live plans", async () => {
  act(() => {
    usePlanStore.getState().addPlan({
      code: "BBCA",
      name: "",
      entry: 9000,
      stopLoss: 8700,
      target: null,
      lots: 1,
      note: "",
    });
  });
  renderScreen();
  await screen.findByText("TLKM");

  fireEvent.press(screen.getByText("Saham di plan kamu"));

  expect(screen.getByText("BBCA Naik, Asing Borong Saham Bank")).toBeOnTheScreen();
  expect(screen.queryByText(/IHSG Ditutup Menguat/)).toBeNull();
});

it("offers a retry when no feed can be read", async () => {
  jest.mocked(fetchNews).mockRejectedValue(new Error("offline"));
  renderScreen();

  expect(await screen.findByText("Berita gagal dimuat")).toBeOnTheScreen();
});
