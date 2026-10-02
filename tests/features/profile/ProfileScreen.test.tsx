import { act, fireEvent, render, screen } from "@testing-library/react-native";

import {
  connectGoogle,
  disconnectGoogle,
  syncNow,
} from "@/features/google-sheets/services/sync";
import { useSheetStore } from "@/features/google-sheets/stores/sheet.store";
import { ProfileScreen } from "@/features/profile/components/ProfileScreen";
import { changeLanguage } from "@/plugins/i18n";
import { ToastProvider } from "@/shared/components";
import { useProfileStore } from "@/shared/stores";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/plugins/google", () => ({
  DRIVE_FILE_SCOPE: "https://www.googleapis.com/auth/drive.file",
  isGoogleConfigured: true,
  ensureGoogleConfigured: jest.fn(),
}));

jest.mock("@/features/google-sheets/services/sync", () => ({
  connectGoogle: jest.fn(),
  disconnectGoogle: jest.fn(async () => undefined),
  syncNow: jest.fn(async () => undefined),
}));

const account = {
  id: "g1",
  email: "ricky@example.com",
  name: "Ricky G",
  photo: null,
};

beforeAll(async () => {
  await changeLanguage("id");
});

beforeEach(() => {
  jest.clearAllMocks();
  act(() => {
    useProfileStore.setState({ name: "Ricky", balance: 10000000, riskPercent: 2 });
    useSheetStore.setState({
      account: null,
      spreadsheets: {},
      lastSyncedAt: null,
      syncing: false,
      error: null,
    });
  });
});

const renderScreen = () =>
  render(
    <ToastProvider>
      <ProfileScreen />
    </ToastProvider>,
  );

it("shows who the plan belongs to and links to the risk setting", () => {
  renderScreen();

  expect(screen.getByText("Ricky")).toBeOnTheScreen();
  expect(screen.getByText(/^Rp\s?10\.000\.000$/)).toBeOnTheScreen();

  fireEvent.press(screen.getByText("Risiko per trade"));

  expect(mockPush).toHaveBeenCalledWith("/settings");
});

it("connects a Google account from the sign-in button", async () => {
  jest.mocked(connectGoogle).mockResolvedValue("cancelled");
  renderScreen();

  fireEvent.press(screen.getByTestId("google-sign-in"));

  expect(connectGoogle).toHaveBeenCalled();
  expect(await screen.findByText("Login Google dibatalkan")).toBeOnTheScreen();
});

describe("once connected", () => {
  beforeEach(() => {
    act(() =>
      useSheetStore.setState({
        account,
        spreadsheets: {
          g1: { spreadsheetId: "s1", spreadsheetUrl: "https://docs.google.com/s1" },
        },
        lastSyncedAt: new Date().toISOString(),
      }),
    );
  });

  it("shows the account, the spreadsheet and the last sync", () => {
    renderScreen();

    expect(screen.getByText("ricky@example.com")).toBeOnTheScreen();
    expect(screen.getByText("Buka di Google Sheets")).toBeOnTheScreen();
    expect(screen.getByText(/^Disinkronkan/)).toBeOnTheScreen();
    expect(screen.queryByTestId("google-sign-in")).toBeNull();
  });

  it("syncs on request", () => {
    renderScreen();

    fireEvent.press(screen.getByText("Sinkronkan sekarang"));

    expect(syncNow).toHaveBeenCalled();
  });

  it("offers to sign in again when access has ended", () => {
    act(() => useSheetStore.setState({ error: "reconnect" }));
    renderScreen();

    expect(
      screen.getByText("Akses Google sudah berakhir. Hubungkan ulang akunmu."),
    ).toBeOnTheScreen();
    expect(screen.getByTestId("google-sign-in")).toBeOnTheScreen();
  });

  it("disconnects only after confirming", async () => {
    renderScreen();

    fireEvent.press(screen.getByText("Putuskan akun Google"));
    expect(disconnectGoogle).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByText("Putuskan"));
    });

    expect(disconnectGoogle).toHaveBeenCalled();
  });
});
