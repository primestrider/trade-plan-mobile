/** Copy for the home screen. */
export default {
  greeting: "Hi, {{name}}",
  balance: "Trading capital",
  openSettings: "Settings",

  editBalance: {
    action: "Edit",
    hint: "Opens a sheet to change your trading capital",
    title: "Edit trading capital",
    description: "Your risk limit per trade is worked out from this amount.",
  },

  risk: {
    label: "Max loss per trade",
    action: "Change",
    hint: "Opens settings to change your risk per trade",
    description:
      "{{percent}} of your capital. Place your stop loss so one losing trade costs no more than this.",
  },
};
