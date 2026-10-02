import { act } from "@testing-library/react-native";

import { useProfileStore } from "@/shared/stores";
import { mmkvStorage, storageKeys } from "@/plugins/mmkv";

const initialState = {
  name: "",
  balance: 0,
  hasCompletedOnboarding: false,
  riskPercent: 2,
};

beforeEach(() => {
  act(() => useProfileStore.setState(initialState));
});

describe("the onboarding gate", () => {
  it("starts closed, so a fresh install is sent through onboarding", () => {
    expect(useProfileStore.getState().hasCompletedOnboarding).toBe(false);
  });

  it("opens once the profile is submitted", () => {
    act(() =>
      useProfileStore
        .getState()
        .completeOnboarding({ name: "Ricky", balance: 10_000_000 }),
    );

    expect(useProfileStore.getState()).toMatchObject({
      name: "Ricky",
      balance: 10_000_000,
      hasCompletedOnboarding: true,
    });
  });
});

describe("risk per trade", () => {
  it("starts at 2%", () => {
    expect(useProfileStore.getState().riskPercent).toBe(2);
  });

  it.each([
    [1.5, 1.5],
    [0.1, 0.5],
    [12, 5],
    [2.74, 2.5],
    [Number.NaN, 2],
  ])("stores %p as %p", (input, stored) => {
    act(() => useProfileStore.getState().setRiskPercent(input));

    expect(useProfileStore.getState().riskPercent).toBe(stored);
  });
});

describe("persistence", () => {
  /**
   * MMKV is synchronous, so what lands here is rehydrated before the first
   * render — the guard in `src/app/_layout.tsx` never flashes onboarding at a
   * user who has already been through it.
   */
  it("writes the profile to MMKV under the shared key", () => {
    act(() =>
      useProfileStore
        .getState()
        .completeOnboarding({ name: "Ricky", balance: 250_000 }),
    );

    const stored = mmkvStorage.getString(storageKeys.user.profile);

    expect(stored).toBeDefined();
    expect(JSON.parse(stored!).state).toMatchObject({
      name: "Ricky",
      balance: 250_000,
      hasCompletedOnboarding: true,
    });
  });
});
