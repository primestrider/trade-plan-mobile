import type { StateStorage } from "zustand/middleware";

import { mmkvStorage } from "./index";

/**
 * Zustand persistent storage adapter backed by MMKV.
 * Use this with the `persist` middleware to persist Zustand state to MMKV.
 */
export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    mmkvStorage.set(name, value);
  },

  getItem: (name) => {
    return mmkvStorage.getString(name) ?? null;
  },

  removeItem: (name) => {
    mmkvStorage.remove(name);
  },
};
