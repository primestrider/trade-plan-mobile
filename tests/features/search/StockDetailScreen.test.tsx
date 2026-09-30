import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";

import { StockDetailScreen } from "@/features/search/components/StockDetailScreen";
import { fetchStockByCode } from "@/features/search/services/api";
import { changeLanguage } from "@/plugins/i18n";
import { queryClient } from "@/plugins/react-query";

import { bbca } from "./fixtures";

jest.mock("@/features/search/services/api", () => ({
  fetchStockByCode: jest.fn(),
}));

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
}));

const mockFetchStockByCode = jest.mocked(fetchStockByCode);

function renderScreen(code: string, client = newClient()) {
  return render(
    <QueryClientProvider client={client}>
      <StockDetailScreen code={code} />
    </QueryClientProvider>,
  );
}

/** The app's own query defaults (staleness above all), minus retries. */
function newClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { ...queryClient.getDefaultOptions().queries, retry: false },
    },
  });
}

beforeAll(async () => {
  await changeLanguage("id");
});

beforeEach(() => {
  mockFetchStockByCode.mockReset();
});

it("shows the stock straight from the search list without asking again", () => {
  const client = newClient();
  client.setQueryData(["stocks", "list"], [bbca]);

  renderScreen("BBCA", client);

  expect(screen.getByText("Bank Central Asia Tbk.")).toBeOnTheScreen();
  expect(mockFetchStockByCode).not.toHaveBeenCalled();
});

it("fetches the stock by its code when it is not cached", async () => {
  mockFetchStockByCode.mockResolvedValue(bbca);

  renderScreen("BBCA");

  expect(await screen.findByText("Bank Central Asia Tbk.")).toBeOnTheScreen();
  expect(mockFetchStockByCode).toHaveBeenCalledWith("BBCA");
});

it("lays out today's trading, performance, valuation and risk", async () => {
  mockFetchStockByCode.mockResolvedValue(bbca);

  renderScreen("BBCA");

  // Price and today's move.
  expect(await screen.findByText("6.075")).toBeOnTheScreen();
  expect(screen.getByText(/▼ 75 \(-1,22%\)/)).toBeOnTheScreen();

  // Today's trading.
  expect(screen.getByText("Perdagangan hari ini")).toBeOnTheScreen();
  expect(screen.getByText("221,3jt lembar")).toBeOnTheScreen();
  expect(screen.getByText("28.248 kali")).toBeOnTheScreen();

  // Where the price sits in its year.
  expect(screen.getByText("Rentang 52 minggu")).toBeOnTheScreen();
  expect(screen.getByText("4.820")).toBeOnTheScreen();
  expect(screen.getByText("8.750")).toBeOnTheScreen();

  // Performance across every period.
  expect(screen.getByText("10T")).toBeOnTheScreen();
  expect(screen.getByText("+93,5%")).toBeOnTheScreen();

  // Valuation and risk.
  expect(screen.getByText("12,90x")).toBeOnTheScreen();
  expect(screen.getByText("Rp 748,9T")).toBeOnTheScreen();
  expect(screen.getByText("42,5%")).toBeOnTheScreen();
  expect(screen.getByText("0,84")).toBeOnTheScreen();
  expect(screen.getByText("35,0%")).toBeOnTheScreen();
});

it("says so when no stock has the code", async () => {
  mockFetchStockByCode.mockResolvedValue(null);

  renderScreen("ZZZZ");

  expect(
    await screen.findByText("Tidak ada saham dengan kode ZZZZ"),
  ).toBeOnTheScreen();
});

it("offers a retry when the stock fails to load", async () => {
  mockFetchStockByCode.mockRejectedValue(new Error("offline"));

  renderScreen("BBCA");

  expect(await screen.findByText("Data saham gagal dimuat")).toBeOnTheScreen();
  expect(screen.getByText("Coba lagi")).toBeOnTheScreen();
});
