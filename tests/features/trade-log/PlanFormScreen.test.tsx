import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { PlanFormScreen } from "@/features/trade-log/components/PlanFormScreen";
import { usePlanStore } from "@/features/trade-log/stores/plan.store";
import { fetchStocks } from "@/features/search/services/api";
import { changeLanguage } from "@/plugins/i18n";
import { useProfileStore } from "@/shared/stores";

import { bbca } from "../search/fixtures";

jest.mock("@/features/search/services/api", () => ({
  fetchStocks: jest.fn(),
}));

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ replace: mockReplace, back: jest.fn() }),
}));

beforeAll(async () => {
  await changeLanguage("id");
});

beforeEach(() => {
  jest.mocked(fetchStocks).mockResolvedValue([bbca]);
  mockReplace.mockClear();
  act(() => {
    useProfileStore.setState({ balance: 10000000, riskPercent: 2 });
    usePlanStore.setState({ plans: [] });
  });
});

function renderForm(code?: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(["stocks", "list"], [bbca]);

  return render(
    <QueryClientProvider client={client}>
      <PlanFormScreen code={code} />
    </QueryClientProvider>,
  );
}

it("works out the lot size from the typed prices and the risk limit", async () => {
  renderForm("BBCA");

  fireEvent.changeText(screen.getByLabelText("Entry"), "9000");
  fireEvent.changeText(screen.getByLabelText("Stop loss"), "8700");

  expect(await screen.findByText("6 lot")).toBeOnTheScreen();
});

it("refuses a stop loss too wide for the limit", async () => {
  act(() => useProfileStore.setState({ balance: 1000000 }));
  renderForm("BBCA");

  fireEvent.changeText(screen.getByLabelText("Entry"), "9000");
  fireEvent.changeText(screen.getByLabelText("Stop loss"), "4000");

  expect(await screen.findByText(/^Stop loss terlalu jauh/)).toBeOnTheScreen();
});

it("saves the plan as planned and opens its page", async () => {
  renderForm();

  fireEvent.changeText(screen.getByLabelText("Kode saham"), "bbca");
  fireEvent.changeText(screen.getByLabelText("Entry"), "9000");
  fireEvent.changeText(screen.getByLabelText("Stop loss"), "8700");
  fireEvent.press(screen.getByText("Simpan plan"));

  await screen.findByText("6 lot");
  await act(async () => {});

  const [plan] = usePlanStore.getState().plans;
  expect(plan).toMatchObject({
    code: "BBCA",
    entry: 9000,
    stopLoss: 8700,
    target: null,
    lots: 6,
    status: "planned",
  });
  expect(mockReplace).toHaveBeenCalledWith({
    pathname: "/plan/[id]",
    params: { id: plan.id },
  });
});

it("names the valid prices nearest an off-tick entry", async () => {
  renderForm("BBCA");

  fireEvent.changeText(screen.getByLabelText("Entry"), "9010");
  fireEvent.changeText(screen.getByLabelText("Stop loss"), "8700");
  fireEvent.press(screen.getByText("Simpan plan"));

  expect(
    await screen.findByText(
      "Bukan harga yang valid di BEI. Fraksi harga di rentang ini 25: coba 9.000 atau 9.025.",
    ),
  ).toBeOnTheScreen();
  expect(usePlanStore.getState().plans).toHaveLength(0);
});

it("keeps the note written with the plan", async () => {
  renderForm("BBCA");

  fireEvent.changeText(screen.getByLabelText("Entry"), "9000");
  fireEvent.changeText(screen.getByLabelText("Stop loss"), "8700");
  fireEvent.changeText(
    screen.getByLabelText("Catatan (opsional)"),
    "  Breakout dari base 3 minggu  ",
  );
  fireEvent.press(screen.getByText("Simpan plan"));
  await act(async () => {});

  expect(usePlanStore.getState().plans[0].note).toBe(
    "Breakout dari base 3 minggu",
  );
});

it("warns before averaging down into an open position", async () => {
  act(() => {
    const { addPlan, openPlan } = usePlanStore.getState();
    openPlan(
      addPlan({
        code: "BBCA",
        name: "",
        entry: 9000,
        stopLoss: 8700,
        target: null,
        lots: 2,
        note: "",
      }),
    );
  });
  renderForm("BBCA");

  fireEvent.changeText(screen.getByLabelText("Entry"), "8500");

  expect(
    await screen.findByText(/^Kamu sudah memegang BBCA dari harga 9\.000/),
  ).toBeOnTheScreen();
});

it("sizes at 1% while on a losing streak, and says why", async () => {
  const loss = (day: number) => ({
    id: `l${day}`,
    code: "TLKM",
    name: "",
    entry: 3000,
    stopLoss: 2900,
    target: null,
    lots: 1,
    status: "closed" as const,
    createdAt: `2026-09-0${day}T00:00:00.000Z`,
    openedAt: null,
    closedAt: `2026-09-0${day}T08:00:00.000Z`,
    exitPrice: 2900,
    note: "",
  });
  act(() => usePlanStore.setState({ plans: [loss(1), loss(2), loss(3)] }));
  renderForm("BBCA");

  fireEvent.changeText(screen.getByLabelText("Entry"), "9000");
  fireEvent.changeText(screen.getByLabelText("Stop loss"), "8700");

  // 1% of 10 jt = 100.000; 30.000 per lot → 3 lots instead of 6.
  expect(await screen.findByText("3 lot")).toBeOnTheScreen();
  expect(
    screen.getByText(/karena kamu sedang 3 kali rugi berturut-turut\.$/),
  ).toBeOnTheScreen();
});
