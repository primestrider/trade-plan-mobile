import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { HomeScreen } from "@/features/home/components/HomeScreen";
import { changeLanguage } from "@/plugins/i18n";
import { useProfileStore } from "@/shared/stores";

beforeAll(async () => {
  await changeLanguage("id");
});

beforeEach(() => {
  act(() =>
    useProfileStore.setState({
      name: "Ricky",
      balance: 10000000,
      hasCompletedOnboarding: true,
    }),
  );
});

it("greets the user by the name given in onboarding", () => {
  render(<HomeScreen />);

  expect(screen.getByText("Halo, Ricky")).toBeOnTheScreen();
});

it("shows the stored balance in rupiah, read as one amount", () => {
  render(<HomeScreen />);

  expect(screen.getByText("10.000.000")).toBeOnTheScreen();
  expect(
    screen.getByLabelText(/^Modal trading, Rp\s?10\.000\.000$/),
  ).toBeOnTheScreen();
});

describe("editing the balance", () => {
  const openSheet = () =>
    fireEvent.press(screen.getByRole("button", { name: /^Modal trading/ }));

  it("opens a sheet holding the current balance", () => {
    render(<HomeScreen />);

    openSheet();

    expect(screen.getByText("Ubah modal trading")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("10.000.000")).toBeOnTheScreen();
  });

  it("stores the new balance on save and shows it on the home screen", async () => {
    render(<HomeScreen />);

    openSheet();
    fireEvent.changeText(screen.getByDisplayValue("10.000.000"), "25000000");
    fireEvent.press(screen.getByText("Simpan"));

    expect(await screen.findByText("25.000.000")).toBeOnTheScreen();
    expect(useProfileStore.getState().balance).toBe(25000000);
  });

  it("refuses an empty amount and keeps the stored balance", async () => {
    render(<HomeScreen />);

    openSheet();
    fireEvent.changeText(screen.getByDisplayValue("10.000.000"), "");
    fireEvent.press(screen.getByText("Simpan"));

    expect(await screen.findByText("Modal awal wajib diisi")).toBeOnTheScreen();
    expect(useProfileStore.getState().balance).toBe(10000000);
  });

  it("discards the draft when cancelled", () => {
    render(<HomeScreen />);

    openSheet();
    fireEvent.changeText(screen.getByDisplayValue("10.000.000"), "5");
    fireEvent.press(screen.getByText("Batal"));

    expect(useProfileStore.getState().balance).toBe(10000000);
  });
});
