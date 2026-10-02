import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { StatsScreen } from "@/features/trade-log/components/StatsScreen";
import type { TradePlan } from "@/features/trade-log/models/plan";
import { usePlanStore } from "@/features/trade-log/stores/plan.store";
import { changeLanguage } from "@/plugins/i18n";
import { useProfileStore } from "@/shared/stores";

jest.mock("expo-router", () => ({ Stack: { Screen: () => null } }));

const closed = (id: string, exitPrice: number, day: number): TradePlan => ({
  id,
  code: "BBCA",
  name: "",
  entry: 1000,
  stopLoss: 900,
  target: null,
  lots: 1,
  status: "closed",
  createdAt: `2026-09-0${day}T00:00:00.000Z`,
  openedAt: null,
  closedAt: `2026-09-0${day}T08:00:00.000Z`,
  exitPrice,
  note: "",
});

beforeAll(async () => {
  await changeLanguage("id");
});

beforeEach(() => {
  act(() => {
    useProfileStore.setState({ balance: 10000000 });
    usePlanStore.setState({ plans: [] });
  });
});

it("invites closing a first trade before there is anything to show", () => {
  render(<StatsScreen />);

  expect(screen.getByText("Belum ada trade yang selesai")).toBeOnTheScreen();
});

it("shows the result, the curve and the figures behind it", () => {
  act(() =>
    usePlanStore.setState({
      plans: [closed("a", 1200, 1), closed("b", 900, 2), closed("c", 1100, 3)],
    }),
  );
  render(<StatsScreen />);

  // The headline, and the curve readout resting on the latest trade.
  expect(screen.getAllByText(/^\+Rp\s?20\.000$/)).toHaveLength(2);
  expect(
    screen.getByLabelText(/^Akumulasi hasil dari 3 trade, berakhir di Rp\s?20\.000\./),
  ).toBeOnTheScreen();
  expect(screen.getByText("Setelah trade ke-3")).toBeOnTheScreen();
  expect(screen.getByText("Profit factor")).toBeOnTheScreen();
  expect(screen.getByText("3")).toBeOnTheScreen(); // profit factor 30.000 / 10.000
});

it("reads out the total at the trade under the finger", () => {
  act(() =>
    usePlanStore.setState({
      plans: [closed("a", 1200, 1), closed("b", 900, 2), closed("c", 1100, 3)],
    }),
  );
  render(<StatsScreen />);

  const chart = screen.getByRole("image");
  fireEvent(chart, "layout", { nativeEvent: { layout: { width: 216, height: 168 } } });
  // Inset 8px, 200px across 3 steps: trade 1 sits at x = 8 + 66.7.
  fireEvent(chart, "responderGrant", { nativeEvent: { locationX: 75 } });

  expect(screen.getByText("Setelah trade ke-1")).toBeOnTheScreen();
});
