/**
 * Copy shared by every feature — actions, states, and generic errors.
 *
 * English is the reference shape: `utils.id.ts` is typed against this file, so
 * a key added here and forgotten there fails the build rather than falling
 * back silently at runtime.
 */
export default {
  appName: "RN Expo Boilerplate",
  language: "Language",

  action: {
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    clear: "Clear",
    retry: "Try again",
    delete: "Delete",
    close: "Close",
    goHome: "Go to home",
  },

  state: {
    loading: "Loading…",
    empty: "Nothing here yet",
    offline: "You are offline",
  },

  form: {
    required: "{{field}} is required",
    invalidEmail: "Enter a valid email address",
    minLength: "{{field}} must be at least {{count}} characters",
    maxLength: "{{field}} must be at most {{count}} characters",
  },

  error: {
    generic: "Something went wrong. Please try again.",
    network: "Cannot reach the server. Check your connection.",
    unauthorized: "Your session has expired. Please sign in again.",
  },

  fallback: {
    notFoundTitle: "This screen does not exist",
    notFoundDescription: "The link may be broken, or the screen may have moved.",
    errorTitle: "Something went wrong",
    errorDescription: "The screen could not be displayed.",
  },
};
