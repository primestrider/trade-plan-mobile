/** Copy for the settings screen. */
export default {
  title: "Settings",

  risk: {
    title: "Risk per trade",
    description:
      "The most you are willing to lose on one trade, as a share of your capital.",
    maxLoss: "Max loss per trade",
    capital: "Trading capital",

    level: {
      conservative: "Conservative",
      standard: "Standard",
      aggressive: "Aggressive",
    },

    advice: {
      conservative:
        "Smaller losses per trade. Suits a large capital, or a stretch of losing trades.",
      standard:
        "The common rule of thumb. Ten losses in a row still leave most of your capital.",
      aggressive:
        "A few losses in a row cut deep into your capital. Keep this for setups you are sure of.",
    },
  },

  streakGuard: {
    title: "Lower risk on a losing streak",
    description:
      "After 3 losses in a row, new plans are sized at 1% until a win breaks the streak.",
  },

  data: {
    title: "Your data",
    description: "Plans are stored on this phone only. Keep a backup somewhere else.",
    backup: "Back up data",
    backupHint: "Saves your profile and every plan as a JSON file",
    csv: "Export trade log",
    csvHint: "A CSV file for a spreadsheet",
    restore: "Restore from backup",
    restoreHint: "Replaces the data on this phone with a backup file",
    restoreDialog: {
      title: "Replace your data?",
      body: "The backup from {{date}} holds {{count}} plans. Your current profile and plans on this phone will be replaced.",
      action: "Replace",
    },
    restored: "Data restored",
    invalid: "This file is not a Trade Plan backup",
    failed: "The file could not be shared. Try again.",
  },
};
