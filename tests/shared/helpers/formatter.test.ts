import {
  camelCase,
  capitalize,
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  formatNumber,
  formatPercent,
  formatPhone,
  formatRelativeTime,
  formatTime,
  getInitials,
  kebabCase,
  maskCardNumber,
  maskEmail,
  maskPhone,
  maskString,
  snakeCase,
  titleCase,
  truncate,
} from "@/shared/helpers/formatter";
import { setActiveLanguage } from "@/shared/helpers/locale";

/**
 * `Intl` separates a currency symbol from its digits with a non-breaking
 * space, which varies between ICU versions. Comparing on normalized spaces
 * keeps these assertions about formatting, not about ICU internals.
 */
function spaces(value: string): string {
  return value.replace(/ /g, " ");
}

/** Dates are built from local parts so results do not depend on the machine's timezone. */
const SEP_18 = new Date(2026, 8, 18, 14, 30, 0);

beforeEach(() => {
  setActiveLanguage("en");
});

describe("formatNumber", () => {
  it("groups digits for the active language", () => {
    expect(formatNumber(1234567.891)).toBe("1,234,567.891");
    expect(formatNumber(1234567.891, { language: "id" })).toBe("1.234.567,891");
  });

  it("honours fraction digit options", () => {
    expect(formatNumber(1234.5, { maximumFractionDigits: 0 })).toBe("1,235");
  });

  it("accepts numeric strings, including localized ones", () => {
    expect(formatNumber("1234.56")).toBe("1,234.56");
    expect(formatNumber("1.234,56", { language: "id" })).toBe("1.234,56");
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["non-numeric text", "abc"],
    ["an empty string", ""],
    ["NaN", NaN],
    ["Infinity", Infinity],
  ])("returns a placeholder for %s", (_label, value) => {
    expect(formatNumber(value)).toBe("-");
  });
});

describe("formatCurrency", () => {
  it("defaults to IDR without decimals", () => {
    expect(spaces(formatCurrency(1250000, { language: "id" }))).toBe(
      "Rp 1.250.000",
    );
  });

  it("uses two decimals for other currencies", () => {
    expect(spaces(formatCurrency(19.99, { currency: "USD" }))).toBe("$19.99");
  });

  it("returns a placeholder for invalid input", () => {
    expect(formatCurrency("abc")).toBe("-");
  });
});

describe("formatCompactNumber", () => {
  it.each([
    [999, "999"],
    [1234, "1.2K"],
    [5400000, "5.4M"],
    [1000000000, "1B"],
    [-2500, "-2.5K"],
  ])("shortens %s to %s", (input, expected) => {
    expect(formatCompactNumber(input)).toBe(expected);
  });

  it("uses Indonesian suffixes", () => {
    expect(formatCompactNumber(1234, { language: "id" })).toBe("1,2rb");
    expect(formatCompactNumber(5400000, { language: "id" })).toBe("5,4jt");
  });

  it("drops the fraction when the scaled value is whole", () => {
    expect(formatCompactNumber(2000)).toBe("2K");
  });
});

describe("formatPercent", () => {
  it("renders a ratio as a percentage", () => {
    expect(formatPercent(0.4267)).toBe("43%");
    expect(formatPercent(0.4267, { fractionDigits: 1 })).toBe("42.7%");
  });
});

describe("formatFileSize", () => {
  it.each([
    [0, "0 B"],
    [512, "512 B"],
    [1536, "1.5 KB"],
    [10485760, "10 MB"],
  ])("formats %s bytes as %s", (input, expected) => {
    expect(formatFileSize(input)).toBe(expected);
  });

  it("supports decimal units", () => {
    expect(formatFileSize(1500, { binary: false })).toBe("1.5 KB");
  });

  it("rejects negative sizes", () => {
    expect(formatFileSize(-5)).toBe("-");
  });
});

describe("date formatting", () => {
  it("formats dates with the default and custom patterns", () => {
    expect(formatDate(SEP_18)).toBe("18 Sep 2026");
    expect(formatDate(SEP_18, "dd/MM/yyyy")).toBe("18/09/2026");
  });

  it("localizes month names", () => {
    expect(formatDate(new Date(2026, 0, 5), "MMMM", { language: "id" })).toBe(
      "Januari",
    );
  });

  it("formats time and date-time", () => {
    expect(formatTime(SEP_18)).toBe("14:30");
    expect(formatDateTime(SEP_18)).toBe("18 Sep 2026, 14:30");
  });

  it.each([
    ["an invalid string", "not a date"],
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
  ])("returns a placeholder for %s", (_label, value) => {
    expect(formatDate(value)).toBe("-");
  });

  describe("formatRelativeTime", () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 8, 18, 12, 0, 0));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("describes the distance from now", () => {
      expect(formatRelativeTime(new Date(2026, 8, 18, 10, 0, 0))).toBe(
        "about 2 hours ago",
      );
    });

    it("localizes the distance", () => {
      expect(
        formatRelativeTime(new Date(2026, 8, 18, 10, 0, 0), { language: "id" }),
      ).toBe("sekitar 2 jam yang lalu");
    });

    it("can omit the suffix", () => {
      expect(
        formatRelativeTime(new Date(2026, 8, 18, 10, 0, 0), {
          addSuffix: false,
        }),
      ).toBe("about 2 hours");
    });
  });
});

describe("formatPhone", () => {
  it.each([
    ["a local number", "081234567890"],
    ["an E.164 number", "+6281234567890"],
    ["a number with separators", "0812-3456-7890"],
  ])("groups %s", (_label, input) => {
    expect(formatPhone(input)).toBe("+62 812-3456-7890");
  });

  it("supports other country codes", () => {
    expect(formatPhone("5550001234", "1")).toBe("+1 555-0001-234");
  });

  it("returns a placeholder when there are no digits", () => {
    expect(formatPhone("no digits here")).toBe("-");
  });
});

describe("string case helpers", () => {
  it("capitalizes only the first character", () => {
    expect(capitalize("hello world")).toBe("Hello world");
  });

  it("title-cases every word", () => {
    expect(titleCase("john doe")).toBe("John Doe");
  });

  it.each([
    ["spaced words", "user profile settings", "userProfileSettings"],
    ["kebab-case", "user-profile", "userProfile"],
    ["snake_case", "user_profile", "userProfile"],
  ])("camelCases %s", (_label, input, expected) => {
    expect(camelCase(input)).toBe(expected);
  });

  it("converts camelCase into kebab and snake case", () => {
    expect(kebabCase("userProfileSettings")).toBe("user-profile-settings");
    expect(snakeCase("User Profile")).toBe("user_profile");
  });
});

describe("truncate", () => {
  it("leaves short text untouched", () => {
    expect(truncate("short", 15)).toBe("short");
  });

  it("keeps a whole word when the cut lands on a boundary", () => {
    expect(truncate("The quick brown fox jumps", 15)).toBe("The quick brown…");
  });

  it("drops the partial word when the cut lands mid-word", () => {
    expect(truncate("The quick brown fox jumps", 18)).toBe("The quick brown…");
  });

  it("accepts a custom suffix", () => {
    expect(truncate("The quick brown fox", 9, "...")).toBe("The quick...");
  });
});

describe("getInitials", () => {
  it.each([
    ["John Doe", "JD"],
    ["John Ronald Doe", "JD"],
    ["Cher", "C"],
    ["  spaced   out  ", "SO"],
    ["   ", ""],
  ])("builds initials for %s", (input, expected) => {
    expect(getInitials(input)).toBe(expected);
  });

  it("respects a custom length", () => {
    expect(getInitials("John Ronald Reuel Tolkien", 3)).toBe("JRT");
  });
});

describe("masking", () => {
  it("masks the middle of a string", () => {
    expect(maskString("4111111111111234", { visibleStart: 0, visibleEnd: 4 })).toBe(
      "••••••••••••1234",
    );
  });

  it("masks everything when the string is too short to reveal", () => {
    expect(maskString("abc", { visibleStart: 2, visibleEnd: 2 })).toBe("•••");
  });

  it("keeps the email domain readable", () => {
    expect(maskEmail("john.doe@example.com")).toBe("jo••••••@example.com");
  });

  it("masks a value without an @ as a plain string", () => {
    expect(maskEmail("not-an-email")).toBe("no••••••••il");
  });

  it("reveals only the last digits of a phone number", () => {
    expect(maskPhone("081234567890")).toBe("••••••••7890");
  });

  it("groups a masked card number in blocks of four", () => {
    expect(maskCardNumber("4111 1111 1111 1234")).toBe("•••• •••• •••• 1234");
  });

  it("returns a placeholder for a card number without digits", () => {
    expect(maskCardNumber("no digits")).toBe("-");
  });
});
