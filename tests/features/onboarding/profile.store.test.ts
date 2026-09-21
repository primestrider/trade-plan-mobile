import { act } from "@testing-library/react-native";

import { useProfileStore } from "@/features/onboarding/stores/profile.store";
import { mmkvStorage, storageKeys } from "@/plugins/mmkv";

const initialState = {
  name: "",
  balance: 0,
  hasCompletedOnboarding: false,
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
