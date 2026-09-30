/** Copy for the stock search and stock detail screens. */
export default {
  title: "Search stocks",
  placeholder: "Code or company name",
  loading: "Loading stocks",
  rowHint: "Opens the stock's details",

  noMatch: {
    title: "No stock matches “{{query}}”",
    description: "Check the code, or try part of the company name.",
  },

  error: {
    title: "The stock list could not be loaded",
    description: "Check your connection, then try again.",
  },

  detail: {
    loading: "Loading stock",
    today: "today",
    asOf: "Prices as of {{date}}",

    sections: {
      today: "Today's trading",
      yearRange: "52-week range",
      performance: "Performance",
      valuation: "Valuation",
      risk: "Risk",
    },

    open: "Open",
    prevClose: "Previous close",
    high: "High",
    low: "Low",
    volume: "Volume",
    shares: "{{count}} shares",
    value: "Value",
    frequency: "Frequency",
    trades: "{{count}} trades",

    periods: {
      oneDay: "1D",
      oneWeek: "1W",
      oneMonth: "1M",
      threeMonth: "3M",
      sixMonth: "6M",
      mtd: "MTD",
      ytd: "YTD",
      oneYear: "1Y",
      threeYear: "3Y",
      fiveYear: "5Y",
      tenYear: "10Y",
    },

    perAnnualized: "PER, annualized",
    psr: "PSR, annualized",
    pcfr: "PCFR, annualized",
    marketCap: "Market cap",
    freeFloat: "Free float",
    beta: "1-year beta",
    volatility: "1-year volatility",

    notFound: {
      title: "No stock with the code {{code}}",
      description: "It may have been delisted. Search again from the list.",
    },

    error: {
      title: "This stock could not be loaded",
      description: "Check your connection, then try again.",
    },
  },
};
