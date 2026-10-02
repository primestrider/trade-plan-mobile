/** Copy for the trade log: the plan list, the plan form and a plan's page. */
export default {
  title: "Trade log",

  empty: {
    title: "No trades logged yet",
    description:
      "Write a plan before you buy: entry, stop loss and target. The lot size is worked out from your risk limit.",
    action: "Create plan",
    search: "Search stocks",
  },

  action: {
    create: "Create plan",
    seeAll: "See all",
    edit: "Edit",
    open: "I bought this",
    close: "Close position",
    delete: "Delete plan",
    save: "Save plan",
  },

  status: {
    planned: "Planned",
    open: "Open",
    closed: "Closed",
  },

  section: {
    active: "Active",
    closed: "Closed",
  },

  price: {
    entry: "Entry",
    stopLoss: "Stop loss",
    target: "Target",
    exit: "Exit",
  },

  lots: "{{count}} lot",

  home: {
    title: "Active plans",
    empty: "No active plans. Write one before your next buy.",
    openRisk:
      "{{amount}} at risk across {{count}} open positions, {{percent}} of your capital.",
    openRiskOver:
      "{{amount}} at risk across {{count}} open positions, {{percent}} of your capital. Keep it under {{limit}} before opening another.",
  },

  performance: {
    winRate: "Win rate",
    averageR: "Average R",
    lossStreak: "Losses in a row",
    trades: "From {{count}} closed trades",
    streakAdvice:
      "Three or more losses in a row. Consider lowering your risk per trade until the streak breaks.",
    streakGuarded:
      "Three or more losses in a row. New plans are sized at {{percent}} risk until a win breaks the streak.",
    seeStats: "See statistics",
  },

  form: {
    titleNew: "New plan",
    titleEdit: "Edit plan",
    code: "Stock code",
    codePlaceholder: "BBCA",
    lastPrice: "Last price {{price}}",
    useLastPrice: "Use last price",
    unknownCode: "Not found in the stock list. Check the code.",
    targetOptional: "Target (optional)",
    lots: "Lot size",
    cost: "Capital used",
    risk: "Loss if stopped out",
    reward: "Reward to risk",
    limitedByCapital: "Capped by your capital, not the risk limit.",
    tooWide:
      "The stop loss is too far for your limit of {{maxLoss}}. Move it closer to the entry, or raise your risk per trade.",
    pending: "Fill in the entry and stop loss to work out the lot size.",
    note: "Note (optional)",
    notePlaceholder: "Why this trade, and what would cancel it",
    loweredRisk:
      "Sized at {{percent}} risk while you are on a losing streak of {{count}}.",
    averageDown:
      "You already hold {{code}} from {{entry}}, and this entry is lower. Adding to a losing position raises what one stock can cost you.",
  },

  detail: {
    title: "Plan",
    notFound: "This plan no longer exists.",
    profit: "Result",
    note: "Note",
    planned: "Created {{date}}",
    opened: "Bought {{date}}",
    closed: "Sold {{date}}",
  },

  closeSheet: {
    title: "Close position",
    description: "The price you sold at. The result is measured against your stop loss.",
  },

  deleteDialog: {
    title: "Delete this plan?",
    body: "It is removed from your trade log and its results no longer count.",
  },

  validation: {
    codeInvalid: "Enter a four-letter stock code",
    entryRequired: "Entry price is required",
    stopLossRequired: "Stop loss is required",
    exitRequired: "Exit price is required",
    priceInvalid: "Enter a whole rupiah price above 0",
    stopLossAboveEntry: "Stop loss must be below the entry",
    targetBelowEntry: "Target must be above the entry",
    tickInvalid:
      "Not a valid IDX price. Prices here move in steps of {{tick}}: try {{lower}} or {{upper}}.",
    noteMax: "Keep the note under 500 characters",
  },

  stats: {
    title: "Statistics",
    total: "Realized result",
    totalOf: "From {{count}} closed trades, {{wins}} of them wins. {{percent}} of your current capital.",
    curve: "Running total",
    curveStart: "Before the first trade",
    curveAfter: "After trade {{count}}",
    curveSummary:
      "Running total over {{count}} trades, ending at {{total}}. Highest {{high}}, lowest {{low}}.",
    expectancy: "Expectancy",
    profitFactor: "Profit factor",
    maxDrawdown: "Max drawdown",
    averageWin: "Average win",
    averageLoss: "Average loss",
    best: "Best trade",
    worst: "Worst trade",
    explain:
      "Expectancy is the average result per trade in R: above 0 means the method makes money over time. Profit factor is total profit divided by total loss. Max drawdown is the deepest fall from a high point of the running total.",
    empty: {
      title: "No closed trades yet",
      description: "Statistics appear once you close your first position.",
    },
  },
};
