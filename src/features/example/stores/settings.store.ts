import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@/plugins/mmkv/zustand";

type SettingsState = {
  pushEnabled: boolean;
  emailDigest: boolean;
  setPushEnabled: (enabled: boolean) => void;
  setEmailDigest: (enabled: boolean) => void;
};

/**
 * Notification preferences.
 *
 * Deliberately narrow: the color scheme already lives in `useThemeStore` and
 * the language in the i18n plugin, both persisted. Mirroring them here would
 * give each setting two sources of truth that can disagree.
 *
 * @example
 * const pushEnabled = useSettingsStore((state) => state.pushEnabled);
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pushEnabled: true,
      emailDigest: false,

      setPushEnabled: (pushEnabled) => set({ pushEnabled }),
      setEmailDigest: (emailDigest) => set({ emailDigest }),
    }),
    {
      name: "example.settings",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
