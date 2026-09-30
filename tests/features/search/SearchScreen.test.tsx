import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { SearchScreen } from "@/features/search/components/SearchScreen";
import { fetchStocks } from "@/features/search/services/api";
import { changeLanguage } from "@/plugins/i18n";

import { bbca, stockLike } from "./fixtures";

jest.mock("@/features/search/services/api", () => ({
  fetchStocks: jest.fn(),
}));

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush }),
}));

const mockFetchStocks = jest.mocked(fetchStocks);

const tlkm = stockLike("TLKM", "Telkom Indonesia (Persero) Tbk.");

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <SearchScreen />
    </QueryClientProvider>,
  );
}

beforeAll(async () => {
  await changeLanguage("id");
});

beforeEach(() => {
  mockFetchStocks.mockReset();
  mockPush.mockReset();
});

it("lists every stock with its price once the list arrives", async () => {
  mockFetchStocks.mockResolvedValue([bbca, tlkm]);
  renderScreen();

  expect(await screen.findByText("BBCA")).toBeOnTheScreen();
  expect(screen.getByText("TLKM")).toBeOnTheScreen();
  expect(screen.getAllByText("6.075").length).toBeGreaterThan(0);
});

it("narrows the list to what is typed", async () => {
  mockFetchStocks.mockResolvedValue([bbca, tlkm]);
  renderScreen();
  await screen.findByText("BBCA");

  fireEvent.changeText(screen.getByLabelText("Cari saham"), "telkom");

  await waitFor(() => expect(screen.queryByText("BBCA")).toBeNull());
  expect(screen.getByText("TLKM")).toBeOnTheScreen();
});

it("says so when nothing matches", async () => {
  mockFetchStocks.mockResolvedValue([bbca]);
  renderScreen();
  await screen.findByText("BBCA");

  fireEvent.changeText(screen.getByLabelText("Cari saham"), "zzzz");

  expect(
    await screen.findByText("Tidak ada saham yang cocok dengan “zzzz”"),
  ).toBeOnTheScreen();
});

it("opens the stock's own page when a row is pressed", async () => {
  mockFetchStocks.mockResolvedValue([bbca]);
  renderScreen();

  fireEvent.press(await screen.findByRole("button", { name: /^BBCA,/ }));

  expect(mockPush).toHaveBeenCalledWith({
    pathname: "/stock/[code]",
    params: { code: "BBCA" },
  });
});

it("offers a retry when the list fails to load", async () => {
  mockFetchStocks.mockRejectedValueOnce(new Error("offline"));
  renderScreen();

  expect(await screen.findByText("Daftar saham gagal dimuat")).toBeOnTheScreen();

  mockFetchStocks.mockResolvedValue([bbca]);
  fireEvent.press(screen.getByText("Coba lagi"));

  expect(await screen.findByText("BBCA")).toBeOnTheScreen();
});
