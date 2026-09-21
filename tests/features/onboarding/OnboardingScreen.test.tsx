import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { OnboardingScreen } from "@/features/onboarding/components/OnboardingScreen";
import { useProfileStore } from "@/features/onboarding/stores/profile.store";
import { changeLanguage } from "@/plugins/i18n";

/**
 * Pinned to Indonesian so the copy and the rupiah formatting below are literal
 * rather than whatever locale the test device happens to report.
 */
beforeAll(async () => {
  await changeLanguage("id");
});

beforeEach(() => {
  // The progress bar and the input's focus ring both animate, leaving a frame
  // pending after each interaction; it is drained in `afterEach`. Same pattern
  // as `tests/shared/components/ProgressBar.test.tsx`.
  jest.useFakeTimers();

  act(() =>
    useProfileStore.setState({
      name: "",
      balance: 0,
      hasCompletedOnboarding: false,
    }),
  );
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

const nameField = () => screen.getByPlaceholderText("Nama Anda");
const balanceField = () => screen.getByPlaceholderText("0");

/** Fills in a valid name and moves to the balance step. */
async function reachBalanceStep(name = "Ricky") {
  fireEvent.changeText(nameField(), name);
  fireEvent.press(screen.getByText("Lanjut"));

  await screen.findByPlaceholderText("0");
}

describe("the name step", () => {
  it("is where onboarding starts, with the balance field still out of reach", () => {
    render(<OnboardingScreen />);

    expect(nameField()).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText("0")).not.toBeOnTheScreen();
  });

  it("refuses to advance while the name is too short", async () => {
    render(<OnboardingScreen />);

    fireEvent.changeText(nameField(), "R");
    fireEvent.press(screen.getByText("Lanjut"));

    expect(await screen.findByText("Nama minimal 2 karakter")).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText("0")).not.toBeOnTheScreen();
  });

  it("advances once the name is valid", async () => {
    render(<OnboardingScreen />);

    await reachBalanceStep();

    expect(balanceField()).toBeOnTheScreen();
  });
});

describe("the balance step", () => {
  it("keeps the name when the user steps back to change it", async () => {
    render(<OnboardingScreen />);
    await reachBalanceStep();

    fireEvent.press(screen.getByText("Kembali"));

    expect(await screen.findByDisplayValue("Ricky")).toBeOnTheScreen();
  });

  /**
   * The field itself holds bare digits — `Input type="currency"` strips
   * anything else — so the formatted amount is spelled out beneath it.
   * Without this the user is counting zeroes.
   *
   * Matched with `\s` rather than a literal space: `Intl` separates the symbol
   * from the digits with a non-breaking one, and which it picks varies between
   * ICU versions.
   */
  it("previews what the digits amount to", async () => {
    render(<OnboardingScreen />);
    await reachBalanceStep();

    fireEvent.changeText(balanceField(), "10000000");

    expect(await screen.findByText(/^Rp\s10\.000\.000$/)).toBeOnTheScreen();
  });

  it("will not finish on an empty balance", async () => {
    render(<OnboardingScreen />);
    await reachBalanceStep();

    fireEvent.press(screen.getByText("Mulai"));

    expect(await screen.findByText("Modal awal wajib diisi")).toBeOnTheScreen();
    expect(useProfileStore.getState().hasCompletedOnboarding).toBe(false);
  });
});

describe("finishing", () => {
  it("stores the profile, turning the typed rupiah into a number", async () => {
    render(<OnboardingScreen />);
    await reachBalanceStep();

    fireEvent.changeText(balanceField(), "10000000");
    fireEvent.press(screen.getByText("Mulai"));

    await waitFor(() =>
      expect(useProfileStore.getState()).toMatchObject({
        name: "Ricky",
        balance: 10_000_000,
        hasCompletedOnboarding: true,
      }),
    );
  });
});
