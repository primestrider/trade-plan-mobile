import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "@/plugins/mmkv";
import { zustandStorage } from "@/plugins/mmkv/zustand";

/** What onboarding collects: who the user is and what they trade with. */
export type Profile = {
  name: string;
  balance: number;
};

type ProfileState = Profile & {
  /**
   * Kept as its own flag rather than inferred from `name`, so relaxing the
   * form later cannot quietly reopen the gate and send a returning user back
   * through onboarding.
   */
  hasCompletedOnboarding: boolean;
  completeOnboarding: (profile: Profile) => void;
};

/**
 * The profile captured during onboarding, and the gate that depends on it.
 *
 * MMKV is synchronous, so the stored value is rehydrated before the first
 * render — `src/app/_layout.tsx` can read `hasCompletedOnboarding` while
 * building the navigator without the app flashing onboarding at a user who has
 * already finished it.
 *
 * @example
 * const balance = useProfileStore((state) => state.balance);
 */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: "",
      balance: 0,
      hasCompletedOnboarding: false,

      completeOnboarding: ({ name, balance }) =>
        set({ name, balance, hasCompletedOnboarding: true }),
    }),
    {
      name: storageKeys.user.profile,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
