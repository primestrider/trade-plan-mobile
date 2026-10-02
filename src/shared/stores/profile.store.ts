import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "@/plugins/mmkv";
import { zustandStorage } from "@/plugins/mmkv/zustand";

/** What onboarding collects: who the user is and what they trade with. */
export type Profile = {
  name: string;
  balance: number;
};

/**
 * Bounds for the share of capital one trade may lose, in percent.
 *
 * 2% is the common rule of thumb. Below 0.5% a stop loss on a modest balance
 * gets too tight to place on IDX tick sizes; above 5% a short losing streak
 * takes a large bite out of the capital (ten losses in a row at 5% cost about
 * 40%), so the setting stops there rather than letting the plan become a
 * gamble.
 */
export const RISK_PERCENT = {
  min: 0.5,
  max: 5,
  step: 0.5,
  default: 2,
} as const;

/** Snaps any value onto the allowed risk scale. */
export function clampRiskPercent(value: number): number {
  if (!Number.isFinite(value)) return RISK_PERCENT.default;

  const snapped = Math.round(value / RISK_PERCENT.step) * RISK_PERCENT.step;

  return Math.min(RISK_PERCENT.max, Math.max(RISK_PERCENT.min, snapped));
}

/**
 * The most one trade may lose, in whole rupiah. Rounded down, so the shown
 * limit never sits above the percentage it comes from.
 */
export function maxLossPerTrade(balance: number, riskPercent: number): number {
  return Math.floor((balance * riskPercent) / 100);
}

type ProfileState = Profile & {
  /**
   * Kept as its own flag rather than inferred from `name`, so relaxing the
   * form later cannot quietly reopen the gate and send a returning user back
   * through onboarding.
   */
  hasCompletedOnboarding: boolean;
  /** How much of `balance` one trade may lose, in percent (2 means 2%). */
  riskPercent: number;
  /**
   * Whether risk per trade drops to a smaller amount while the user is on a
   * losing streak. On by default: the moment it matters is the moment a
   * trader is least inclined to turn it on.
   */
  streakGuard: boolean;
  completeOnboarding: (profile: Profile) => void;
  /** Replaces the capital the trading plan is measured against. */
  setBalance: (balance: number) => void;
  /** Stored snapped onto `RISK_PERCENT`, whatever the caller passes. */
  setRiskPercent: (riskPercent: number) => void;
  setStreakGuard: (streakGuard: boolean) => void;
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
      // Profiles saved before this setting existed have no value stored;
      // `persist` merges them over these defaults, so they start at 2%.
      riskPercent: RISK_PERCENT.default,
      streakGuard: true,

      completeOnboarding: ({ name, balance }) =>
        set({ name, balance, hasCompletedOnboarding: true }),

      setBalance: (balance) => set({ balance }),

      setRiskPercent: (riskPercent) =>
        set({ riskPercent: clampRiskPercent(riskPercent) }),

      setStreakGuard: (streakGuard) => set({ streakGuard }),
    }),
    {
      name: storageKeys.user.profile,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
