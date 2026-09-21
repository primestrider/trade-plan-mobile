import { AxiosError, AxiosHeaders } from "axios";

import { setActiveLanguage } from "@/shared/helpers/locale";
import {
  parseBoolean,
  parseCurrency,
  parseDate,
  parseDigits,
  parseErrorMessage,
  parseInteger,
  parseJson,
  parseNumber,
  parsePhone,
} from "@/shared/helpers/parser";

beforeEach(() => {
  setActiveLanguage("en");
});

describe("parseNumber", () => {
  it("parses machine-formatted numbers regardless of language", () => {
    expect(parseNumber("1234.56")).toBe(1234.56);
    expect(parseNumber("1234.56", "id")).toBe(1234.56);
  });

  it("parses grouped numbers for the given language", () => {
    expect(parseNumber("1,234.56")).toBe(1234.56);
    expect(parseNumber("1.234,56", "id")).toBe(1234.56);
  });

  it("ignores currency symbols and spacing", () => {
    expect(parseNumber("Rp 1.234,56", "id")).toBe(1234.56);
    expect(parseNumber("$1,999.00")).toBe(1999);
  });

  it("keeps the sign", () => {
    expect(parseNumber("-1.234,5", "id")).toBe(-1234.5);
  });

  it("passes finite numbers through", () => {
    expect(parseNumber(42)).toBe(42);
    expect(parseNumber(0)).toBe(0);
  });

  it.each([
    ["non-numeric text", "abc"],
    ["a currency symbol alone", "Rp"],
    ["an empty string", ""],
    ["whitespace", "   "],
    ["null", null],
    ["undefined", undefined],
    ["NaN", NaN],
    ["Infinity", Infinity],
    ["an object", {}],
  ])("returns null for %s", (_label, value) => {
    expect(parseNumber(value)).toBeNull();
  });

  it("follows the active language when none is given", () => {
    setActiveLanguage("id");
    expect(parseNumber("1.234,56")).toBe(1234.56);
  });
});

describe("parseCurrency", () => {
  it("strips currency formatting", () => {
    expect(parseCurrency("Rp 1.250.000", "id")).toBe(1250000);
  });
});

describe("parseInteger", () => {
  it("truncates towards zero", () => {
    expect(parseInteger("42.9")).toBe(42);
    expect(parseInteger("-42.9")).toBe(-42);
  });

  it("returns null for non-numeric input", () => {
    expect(parseInteger("abc")).toBeNull();
  });
});

describe("parseBoolean", () => {
  it.each([
    ["true", true],
    ["TRUE", true],
    ["1", true],
    ["yes", true],
    ["y", true],
    ["on", true],
  ])("reads %s as true", (input, expected) => {
    expect(parseBoolean(input)).toBe(expected);
  });

  it.each([["false"], ["0"], ["no"], ["off"], [""]])(
    "reads %s as false",
    (input) => {
      expect(parseBoolean(input)).toBe(false);
    },
  );

  it("passes booleans through and treats numbers numerically", () => {
    expect(parseBoolean(true)).toBe(true);
    expect(parseBoolean(0)).toBe(false);
    expect(parseBoolean(2)).toBe(true);
  });

  it("uses the fallback for unrecognized values", () => {
    expect(parseBoolean("maybe")).toBe(false);
    expect(parseBoolean("maybe", true)).toBe(true);
    expect(parseBoolean(undefined, true)).toBe(true);
  });
});

describe("parseJson", () => {
  it("parses valid JSON", () => {
    expect(parseJson<{ a: number }>('{"a":1}', { a: 0 })).toEqual({ a: 1 });
  });

  it.each([
    ["malformed JSON", "{oops"],
    ["a non-string", 42],
    ["undefined", undefined],
  ])("falls back for %s", (_label, value) => {
    expect(parseJson(value, { fallback: true })).toEqual({ fallback: true });
  });
});

describe("parseDate", () => {
  it("accepts ISO strings, timestamps, and Date objects", () => {
    expect(parseDate("2026-09-18T10:00:00Z")).toBeInstanceOf(Date);
    expect(parseDate(Date.now())).toBeInstanceOf(Date);

    const date = new Date(2026, 8, 18);
    expect(parseDate(date)).toEqual(date);
  });

  it("preserves the exact instant of an ISO string", () => {
    expect(parseDate("2026-09-18T10:00:00Z")?.toISOString()).toBe(
      "2026-09-18T10:00:00.000Z",
    );
  });

  it.each([
    ["an unparsable string", "not a date"],
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
  ])("returns null for %s", (_label, value) => {
    expect(parseDate(value)).toBeNull();
  });
});

describe("parseDigits", () => {
  it("keeps only digits", () => {
    expect(parseDigits("+62 812-3456-7890")).toBe("6281234567890");
    expect(parseDigits("no digits")).toBe("");
  });
});

describe("parsePhone", () => {
  it.each([
    ["a local number", "0812-3456-7890"],
    ["an already normalized number", "+6281234567890"],
    ["a number with spaces", "0812 3456 7890"],
  ])("normalizes %s to E.164", (_label, input) => {
    expect(parsePhone(input)).toBe("+6281234567890");
  });

  it("strips an international 00 prefix", () => {
    expect(parsePhone("006281234567890")).toBe("+6281234567890");
  });

  it("supports other country codes", () => {
    expect(parsePhone("+1 555 000 1234", "1")).toBe("+15550001234");
  });

  it.each([
    ["too few digits", "123"],
    ["no digits", "abc"],
    ["an empty string", ""],
  ])("returns null for %s", (_label, input) => {
    expect(parsePhone(input)).toBeNull();
  });
});

describe("parseErrorMessage", () => {
  function axiosErrorWithData(data: unknown) {
    const error = new AxiosError("Request failed with status code 400");

    error.response = {
      data,
      status: 400,
      statusText: "Bad Request",
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    };

    return error;
  }

  it("prefers the API's message field", () => {
    expect(
      parseErrorMessage(axiosErrorWithData({ message: "Email already taken" })),
    ).toBe("Email already taken");
  });

  it("falls back to the API's error field", () => {
    expect(parseErrorMessage(axiosErrorWithData({ error: "Invalid token" }))).toBe(
      "Invalid token",
    );
  });

  it("falls back to the Axios message when the body carries none", () => {
    expect(parseErrorMessage(axiosErrorWithData({}))).toBe(
      "Request failed with status code 400",
    );
  });

  it("reads plain Errors and strings", () => {
    expect(parseErrorMessage(new Error("boom"))).toBe("boom");
    expect(parseErrorMessage("plain failure")).toBe("plain failure");
  });

  it.each([
    ["an empty object", {}],
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
  ])("uses the default message for %s", (_label, value) => {
    expect(parseErrorMessage(value)).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("accepts a custom fallback", () => {
    expect(parseErrorMessage(null, "Gagal memuat data")).toBe(
      "Gagal memuat data",
    );
  });
});
