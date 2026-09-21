import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "@/plugins/mmkv";
import { zustandStorage } from "@/plugins/mmkv/zustand";

/**
 * How the app decides which color scheme to render.
 * `system` defers to the OS setting and keeps following it as it changes.
 */
export type ThemeMode = "system" | "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

/**
 * Persisted theme preference.
 *
 * MMKV is synchronous, so the stored value is rehydrated before the first
 * render — the app never flashes the wrong theme on launch.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "system",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: storageKeys.app.theme,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
