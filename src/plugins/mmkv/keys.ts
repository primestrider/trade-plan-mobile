/**
 * Centralized storage keys used across the app.
 * Helps avoid hardcoded string literals when reading/writing MMKV values.
 */
export const storageKeys = {
  app: {
    theme: "settings.theme",
    language: "settings.language",
  },

  user: {
    profile: "user.profile",
  },
} as const;
