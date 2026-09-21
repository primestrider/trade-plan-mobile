import { createMMKV } from "react-native-mmkv";

/**
 * Global MMKV storage instance for persistent key-value storage.
 * Used as the underlying storage for Zustand persistence and other app data.
 */
export const mmkvStorage = createMMKV({
  id: "app-mmkv-storage",
});

export * from "./keys";
