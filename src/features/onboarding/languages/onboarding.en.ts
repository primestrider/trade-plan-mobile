/**
 * Copy for the onboarding feature.
 *
 * Validation strings live under `validation` because the zod schema stores
 * translation *keys* rather than finished sentences — the form translates at
 * render time, so an error follows a language switch without the schema ever
 * knowing one exists.
 */
export default {
  title: "Welcome",
  subtitle: "Set up your trading profile before you start.",

  step: {
    name: {
      heading: "What should we call you?",
      label: "Name",
      placeholder: "Your name",
    },

    balance: {
      heading: "How much are you starting with?",
      label: "Starting balance",
      placeholder: "0",
      hint: "The capital your trading plan is measured against.",
    },
  },

  preparing: {
    status: "Preparing your trading plan…",
    rule: "Never risk more than 2% of your capital on a single trade.",
    limit: "is your risk limit per trade, from a capital of {{balance}}.",
  },

  action: {
    next: "Continue",
    back: "Back",
    start: "Start",
  },

  validation: {
    nameMin: "Name must be at least 2 characters",
    nameMax: "Name must be at most 50 characters",
    balanceRequired: "Starting balance is required",
    balanceMin: "Starting balance must be more than 0",
    balanceInvalid: "Starting balance must be a whole number of rupiah",
  },
};
