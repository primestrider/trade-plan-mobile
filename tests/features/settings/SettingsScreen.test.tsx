import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { SettingsScreen } from "@/features/settings/components/SettingsScreen";
import { buildBackup } from "@/features/settings/models/backup";
import {
  exportBackup,
  pickBackup,
  restoreBackup,
} from "@/features/settings/services/backup";
import { changeLanguage } from "@/plugins/i18n";
import { ToastProvider } from "@/shared/components";
import { useProfileStore } from "@/shared/stores";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
}));

jest.mock("@/features/settings/services/backup", () => ({
  exportBackup: jest.fn(),
  exportCsv: jest.fn(),
  pickBackup: jest.fn(),
  restoreBackup: jest.fn(),
}));

beforeAll(async () => {
  await changeLanguage("id");
});

beforeEach(() => {
  jest.clearAllMocks();
  act(() =>
    useProfileStore.setState({
      name: "Ricky",
      balance: 10000000,
      hasCompletedOnboarding: true,
      riskPercent: 2,
      streakGuard: true,
    }),
  );
});

const renderScreen = () =>
  render(
    <ToastProvider>
      <SettingsScreen />
    </ToastProvider>,
  );

it("bounds the slider to 0,5–5% in steps of 0,5", () => {
  renderScreen();

  expect(screen.getByTestId("risk-slider").props).toMatchObject({
    value: 2,
    min: 0.5,
    max: 5,
    step: 0.5,
  });
  expect(screen.getByText("Standar")).toBeOnTheScreen();
});

it("saves a new percentage as the slider moves and shows the new limit", () => {
  renderScreen();

  fireEvent(screen.getByTestId("risk-slider"), "valueChange", 3.5);

  expect(useProfileStore.getState().riskPercent).toBe(3.5);
  expect(screen.getByText("3,5%")).toBeOnTheScreen();
  expect(screen.getByText("Agresif")).toBeOnTheScreen();
  expect(screen.getByText(/^Rp\s?350\.000$/)).toBeOnTheScreen();
});

it("turns the losing-streak guard off and on", () => {
  renderScreen();

  fireEvent(screen.getByTestId("streak-guard-switch"), "valueChange", false);

  expect(useProfileStore.getState().streakGuard).toBe(false);
});

describe("data", () => {
  it("backs up through the share sheet", () => {
    renderScreen();

    fireEvent.press(screen.getByText("Cadangkan data"));

    expect(exportBackup).toHaveBeenCalled();
  });

  it("restores a picked backup only after confirming what it holds", async () => {
    const backup = buildBackup(
      { name: "Ricky", balance: 5000000, riskPercent: 1, streakGuard: true },
      [],
      new Date("2026-09-30T00:00:00Z"),
    );
    jest.mocked(pickBackup).mockResolvedValue({ status: "picked", backup });
    renderScreen();

    fireEvent.press(screen.getByText("Pulihkan dari cadangan"));

    expect(
      await screen.findByText(/^Cadangan dari 30 Sep 2026 berisi 0 plan\./),
    ).toBeOnTheScreen();
    expect(restoreBackup).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText("Ganti"));

    expect(restoreBackup).toHaveBeenCalledWith(backup);
    expect(await screen.findByText("Data dipulihkan")).toBeOnTheScreen();
  });

  it("says so when the file is not a backup", async () => {
    jest.mocked(pickBackup).mockResolvedValue({ status: "invalid" });
    renderScreen();

    fireEvent.press(screen.getByText("Pulihkan dari cadangan"));

    expect(
      await screen.findByText("File ini bukan cadangan Trade Plan"),
    ).toBeOnTheScreen();
  });
});
