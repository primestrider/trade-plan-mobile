import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { HomeScreen } from "@/features/home/components/HomeScreen";
import { changeLanguage } from "@/plugins/i18n";
import { useProfileStore } from "@/shared/stores";
import { usePlanStore } from "@/features/trade-log/stores/plan.store";
import { parseRss } from "@/features/news/helpers/rss";
import { fetchNews } from "@/features/news/services/api";
import { fetchStocks } from "@/features/search/services/api";

import { antaraXml } from "../news/fixtures";

jest.mock("@/features/news/services/api", () => ({
  ...jest.requireActual("@/features/news/services/api"),
  fetchNews: jest.fn(),
}));
jest.mock("@/features/search/services/api", () => ({ fetchStocks: jest.fn() }));
jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn() }));

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeAll(async () => {
  await changeLanguage("id");
});

beforeEach(() => {
  act(() =>
    useProfileStore.setState({
      name: "Ricky",
      balance: 10000000,
      hasCompletedOnboarding: true,
      riskPercent: 2,
    }),
  );
  act(() => usePlanStore.setState({ plans: [] }));
  mockPush.mockClear();
  jest.mocked(fetchNews).mockResolvedValue(parseRss(antaraXml, "ANTARA"));
  jest.mocked(fetchStocks).mockResolvedValue([]);
});

/** Home reads news and the stock list through React Query. */
function renderHome() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <HomeScreen />
    </QueryClientProvider>,
  );
}

it("greets the user by the name given in onboarding", () => {
  renderHome();

  expect(screen.getByText("Halo, Ricky")).toBeOnTheScreen();
});

it("shows the stored balance in rupiah, read as one amount", () => {
  renderHome();

  expect(screen.getByText("10.000.000")).toBeOnTheScreen();
  expect(
    screen.getByLabelText(/^Modal trading, Rp\s?10\.000\.000$/),
  ).toBeOnTheScreen();
});

describe("editing the balance", () => {
  const openSheet = () =>
    fireEvent.press(screen.getByRole("button", { name: /^Modal trading/ }));

  it("opens a sheet holding the current balance", () => {
    renderHome();

    openSheet();

    expect(screen.getByText("Ubah modal trading")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("10.000.000")).toBeOnTheScreen();
  });

  it("stores the new balance on save and shows it on the home screen", async () => {
    renderHome();

    openSheet();
    fireEvent.changeText(screen.getByDisplayValue("10.000.000"), "25000000");
    fireEvent.press(screen.getByText("Simpan"));

    expect(await screen.findByText("25.000.000")).toBeOnTheScreen();
    expect(useProfileStore.getState().balance).toBe(25000000);
  });

  it("refuses an empty amount and keeps the stored balance", async () => {
    renderHome();

    openSheet();
    fireEvent.changeText(screen.getByDisplayValue("10.000.000"), "");
    fireEvent.press(screen.getByText("Simpan"));

    expect(await screen.findByText("Modal awal wajib diisi")).toBeOnTheScreen();
    expect(useProfileStore.getState().balance).toBe(10000000);
  });

  it("discards the draft when cancelled", () => {
    renderHome();

    openSheet();
    fireEvent.changeText(screen.getByDisplayValue("10.000.000"), "5");
    fireEvent.press(screen.getByText("Batal"));

    expect(useProfileStore.getState().balance).toBe(10000000);
  });
});

describe("the risk limit under the balance", () => {
  it("shows the most one trade may lose at the stored percentage", () => {
    act(() => useProfileStore.setState({ riskPercent: 1.5 }));
    renderHome();

    expect(screen.getByText(/^Rp\s?150\.000$/)).toBeOnTheScreen();
    expect(screen.getByText(/^1,5% dari modal\./)).toBeOnTheScreen();
  });

  it("opens settings to change it", () => {
    renderHome();

    fireEvent.press(screen.getByText("Atur"));

    expect(mockPush).toHaveBeenCalledWith("/settings");
  });
});

describe("active plans", () => {
  it("invites a first plan while there is none", () => {
    renderHome();

    fireEvent.press(screen.getByText("Buat plan"));

    expect(mockPush).toHaveBeenCalledWith("/plan/new");
  });

  it("lists live plans and what the open ones put at risk", () => {
    act(() => {
      const { addPlan, openPlan } = usePlanStore.getState();
      const id = addPlan({
        code: "BBCA",
        name: "",
        entry: 9000,
        stopLoss: 8700,
        target: null,
        lots: 6,
        note: "",
      });
      openPlan(id);
    });

    renderHome();

    expect(screen.getByText("BBCA")).toBeOnTheScreen();
    expect(
      screen.getByText(
        /^Rp\s?180\.000 berisiko di 1 posisi terbuka, 1,8% dari modal\.$/,
      ),
    ).toBeOnTheScreen();
  });
});

it("opens the profile from the avatar", () => {
  renderHome();

  fireEvent.press(screen.getByLabelText("Profil"));

  expect(mockPush).toHaveBeenCalledWith("/profile");
});

describe("market news", () => {
  it("shows the latest headlines and opens the news page", async () => {
    renderHome();

    expect(await screen.findByText(/IHSG Ditutup Menguat/)).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Lihat semua"));

    expect(mockPush).toHaveBeenCalledWith("/news");
  });
});
