import { isAxiosError } from "axios";

import type { SupportedLanguage } from "../../../configs/i18n.config";
import { getIntlLocale } from "./locale";

/** Values commonly received from APIs, storage, or text inputs. */
export type DateInput = Date | string | number | null | undefined;

/** A string that already uses `.` as the decimal separator and no grouping. */
const MACHINE_NUMBER = /^-?\d+(\.\d+)?$/;

/**
 * Resolves the grouping and decimal separators a locale uses for numbers.
 * Derived from `Intl` rather than hardcoded so new languages need no changes.
 */
function getNumberSeparators(language?: SupportedLanguage) {
  const parts = new Intl.NumberFormat(getIntlLocale(language)).formatToParts(
    12345.6,
  );

  return {
    group: parts.find((part) => part.type === "group")?.value ?? ",",
    decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
  };
}

/**
 * Parses a user- or API-provided number into a real number.
 * Understands localized input (`"Rp 1.234,56"`) as well as machine input
 * (`"1234.56"`), and returns `null` when the value is not numeric.
 *
 * @example
 * parseNumber('Rp 1.234,56'); // 1234.56 (id)
 * parseNumber('1234.56');     // 1234.56
 * parseNumber('abc');         // null
 */
export function parseNumber(
  value: unknown,
  language?: SupportedLanguage,
): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (trimmed === "") return null;

  if (MACHINE_NUMBER.test(trimmed)) {
    return Number(trimmed);
  }

  const { group, decimal } = getNumberSeparators(language);

  const normalized = trimmed
    .split(group)
    .join("")
    .replace(decimal, ".")
    .replace(/[^0-9.-]/g, "");

  // Without this guard `Number('')` would turn non-numeric text into 0.
  if (!/\d/.test(normalized)) return null;

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Parses a currency string into a number, ignoring symbols and spacing.
 *
 * @example
 * parseCurrency('Rp 1.250.000'); // 1250000
 */
export function parseCurrency(
  value: unknown,
  language?: SupportedLanguage,
): number | null {
  return parseNumber(value, language);
}

/**
 * Parses a value into an integer, discarding any fractional part.
 *
 * @example
 * parseInteger('42.9'); // 42
 */
export function parseInteger(
  value: unknown,
  language?: SupportedLanguage,
): number | null {
  const parsed = parseNumber(value, language);

  return parsed === null ? null : Math.trunc(parsed);
}

/**
 * Parses the many shapes a boolean arrives in — query params, env vars,
 * and loosely typed API responses.
 *
 * @example
 * parseBoolean('true'); // true
 * parseBoolean('0');    // false
 * parseBoolean('yes');  // true
 */
export function parseBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off", ""].includes(normalized)) return false;
  }

  return fallback;
}

/**
 * Parses JSON without throwing — useful for MMKV values and cached payloads
 * that may have been written by an older version of the app.
 *
 * @example
 * parseJson<User>(mmkvStorage.getString('user'), null);
 */
export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Parses an ISO string, timestamp, or `Date` into a valid `Date`.
 * Returns `null` for anything that is not a real date, so callers never
 * render `Invalid Date`.
 *
 * @example
 * parseDate('2026-09-18T10:00:00Z'); // Date
 * parseDate('not a date');           // null
 */
export function parseDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Strips every non-digit character.
 *
 * @example
 * parseDigits('+62 812-3456-7890'); // '6281234567890'
 */
export function parseDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Normalizes a phone number into E.164 (`+6281234567890`), the format most
 * SMS and WhatsApp APIs expect. Returns `null` when too few digits remain.
 *
 * @example
 * parsePhone('0812-3456-7890');  // '+6281234567890'
 * parsePhone('+1 555 000 1234', '1'); // '+15550001234'
 */
export function parsePhone(value: string, countryCode = "62"): string | null {
  let digits = parseDigits(value);

  if (digits === "") return null;

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = countryCode + digits.slice(1);
  } else if (!digits.startsWith(countryCode)) {
    digits = countryCode + digits;
  }

  return digits.length < 8 ? null : `+${digits}`;
}

/**
 * Extracts a human-readable message from anything thrown by Axios,
 * React Query, or plain application code.
 *
 * @example
 * try { await api.post('/login', body); }
 * catch (error) { setError(parseErrorMessage(error)); }
 */
export function parseErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: unknown; error?: unknown }
      | undefined;

    if (typeof data?.message === "string" && data.message !== "") {
      return data.message;
    }

    if (typeof data?.error === "string" && data.error !== "") {
      return data.error;
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message !== "") return error.message;
  if (typeof error === "string" && error !== "") return error;

  return fallback;
}
