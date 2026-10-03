/** Copy for the Google Sheets connection on the profile screen. */
export default {
  title: "Google Sheets",
  description:
    "Connect a Google account to copy your trade log into one spreadsheet in your Google Drive. The app can only open files it created.",
  notConfigured: "Google sign-in is not set up in this build.",
  howItWorks:
    "Plans sync both ways. Change entry, stop loss, target, status, exit or note in the sheet, or add a row for a new plan. Lots are worked out by the app. If the same cell changed in both places, the app's value is kept. Deleting a row does not delete the plan; delete it in the app.",
  open: "Open in Google Sheets",
  syncNow: "Sync now",
  syncing: "Syncing…",
  syncedAt: "Synced {{time}}",
  notSynced: "Not synced yet",
  cancelled: "Google sign-in was cancelled",
  connectFailed: "Could not connect to Google. Try again.",
  connect: "Continue with Google",

  error: {
    offline: "Could not reach Google. It will try again on your next change.",
    reconnect: "Google access has ended. Connect your account again.",
    unknown: "The last sync failed.",
  },

  rejected: {
    title: "Some sheet edits were not taken",
    row: "Row {{row}}, {{code}}: {{reason}}.",
    reason: {
      codeInvalid: "the stock code must be four letters",
      priceMissing: "entry and stop loss are required",
      priceInvalid: "prices must be whole rupiah above 0",
      tickInvalid: "a price is not on the IDX price steps",
      stopLossAboveEntry: "the stop loss must be below the entry",
      targetBelowEntry: "the target must be above the entry",
      statusInvalid: "status must be planned, open or closed",
      exitRequired: "a closed trade needs an exit price",
      tooWide: "the stop loss is too far for your risk limit",
    },
  },

  disconnect: "Disconnect Google account",
  disconnectDialog: {
    title: "Disconnect Google account?",
    body: "The app stops updating the spreadsheet. The spreadsheet stays in your Google Drive.",
    action: "Disconnect",
  },
};
