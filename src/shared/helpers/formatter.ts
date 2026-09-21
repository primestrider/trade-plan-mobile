import { format, formatDistanceToNow } from "date-fns";

import type { SupportedLanguage } from "../../../configs/i18n.config";
import { getActiveLanguage, getDateLocale, getIntlLocale } from "./locale";
import { parseDate, parseNumber, type DateInput } from "./parser";

type LanguageOption = { language?: SupportedLanguage };

/** Shown by every formatter when the input is missing or invalid. */
const EMPTY_VALUE = "-";

/** Compact-notation suffixes per language, ordered by magnitude. */
const compactSuffixes: Record<SupportedLanguage, readonly string[]> = {
  en: ["", "K", "M", "B", "T"],
  id: ["", "rb", "jt", "M", "T"],
};

/**
 * Formats a number using the active language's grouping and decimal marks.
 *
 * @example
 * formatNumber(1234567.891);              // '1,234,567.891' (en)
 * formatNumber(1234.5, { maximumFractionDigits: 0 }); // '1,235'
 */
export function formatNumber(
  value: unknown,
  options: LanguageOption & Intl.NumberFormatOptions = {},
): string {
  const { language, ...numberFormatOptions } = options;
  const numeric = parseNumber(value, language);

  if (numeric === null) return EMPTY_VALUE;

  return new Intl.NumberFormat(
    getIntlLocale(language),
    numberFormatOptions,
  ).format(numeric);
}

/**
 * Formats a monetary value. Defaults to Indonesian Rupiah, which by
 * convention is written without decimals.
 *
 * @example
 * formatCurrency(1250000);                      // 'Rp 1.250.000' (id)
 * formatCurrency(19.99, { currency: 'USD' });   // '$19.99'
 */
export function formatCurrency(
  value: unknown,
  options: LanguageOption & {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
): string {
  const { language, currency = "IDR", ...fractionOptions } = options;
  const numeric = parseNumber(value, language);

  if (numeric === null) return EMPTY_VALUE;

  const defaultDigits = currency === "IDR" ? 0 : 2;

  return new Intl.NumberFormat(getIntlLocale(language), {
    style: "currency",
    currency,
    minimumFractionDigits: fractionOptions.minimumFractionDigits ?? 0,
    maximumFractionDigits: fractionOptions.maximumFractionDigits ?? defaultDigits,
  }).format(numeric);
}

/**
 * Shortens large numbers for dashboards and stat tiles.
 * Implemented without `Intl` compact notation, which is not available on
 * every Hermes build.
 *
 * @example
 * formatCompactNumber(1234);    // '1.2K' (en) / '1,2rb' (id)
 * formatCompactNumber(5400000); // '5.4M'
 */
export function formatCompactNumber(
  value: unknown,
  options: LanguageOption & { fractionDigits?: number } = {},
): string {
  const { language, fractionDigits = 1 } = options;
  const numeric = parseNumber(value, language);

  if (numeric === null) return EMPTY_VALUE;

  const suffixes = compactSuffixes[language ?? getActiveLanguage()];
  const sign = numeric < 0 ? "-" : "";
  const absolute = Math.abs(numeric);

  let magnitude = 0;
  let scaled = absolute;

  while (scaled >= 1000 && magnitude < suffixes.length - 1) {
    scaled /= 1000;
    magnitude += 1;
  }

  const digits = magnitude === 0 || Number.isInteger(scaled) ? 0 : fractionDigits;

  return (
    sign +
    formatNumber(scaled, {
      language,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }) +
    suffixes[magnitude]
  );
}

/**
 * Formats a ratio as a percentage.
 *
 * @example
 * formatPercent(0.4267);                       // '43%'
 * formatPercent(0.4267, { fractionDigits: 1 }); // '42.7%'
 */
export function formatPercent(
  value: unknown,
  options: LanguageOption & { fractionDigits?: number } = {},
): string {
  const { language, fractionDigits = 0 } = options;
  const numeric = parseNumber(value, language);

  if (numeric === null) return EMPTY_VALUE;

  return new Intl.NumberFormat(getIntlLocale(language), {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numeric);
}

/**
 * Formats a byte count as a human-readable file size.
 *
 * @example
 * formatFileSize(1536);     // '1.5 KB'
 * formatFileSize(10485760); // '10 MB'
 */
export function formatFileSize(
  bytes: unknown,
  options: LanguageOption & { fractionDigits?: number; binary?: boolean } = {},
): string {
  const { language, fractionDigits = 1, binary = true } = options;
  const numeric = parseNumber(bytes, language);

  if (numeric === null || numeric < 0) return EMPTY_VALUE;
  if (numeric === 0) return "0 B";

  const base = binary ? 1024 : 1000;
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];

  const magnitude = Math.min(
    Math.floor(Math.log(numeric) / Math.log(base)),
    units.length - 1,
  );

  const scaled = numeric / base ** magnitude;
  const digits = magnitude === 0 ? 0 : fractionDigits;

  return `${formatNumber(scaled, {
    language,
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })} ${units[magnitude]}`;
}

/**
 * Formats a date with a `date-fns` pattern, localized to the active language.
 *
 * @example
 * formatDate('2026-09-18');              // '18 Sep 2026'
 * formatDate(order.createdAt, 'dd/MM/yyyy'); // '18/09/2026'
 */
export function formatDate(
  value: DateInput,
  pattern = "dd MMM yyyy",
  options: LanguageOption = {},
): string {
  const date = parseDate(value);

  if (!date) return EMPTY_VALUE;

  return format(date, pattern, { locale: getDateLocale(options.language) });
}

/**
 * Formats the time portion of a date.
 *
 * @example
 * formatTime('2026-09-18T14:30:00'); // '14:30'
 */
export function formatTime(
  value: DateInput,
  pattern = "HH:mm",
  options: LanguageOption = {},
): string {
  return formatDate(value, pattern, options);
}

/**
 * Formats date and time together.
 *
 * @example
 * formatDateTime('2026-09-18T14:30:00'); // '18 Sep 2026, 14:30'
 */
export function formatDateTime(
  value: DateInput,
  pattern = "dd MMM yyyy, HH:mm",
  options: LanguageOption = {},
): string {
  return formatDate(value, pattern, options);
}

/**
 * Formats a date as a distance from now — ideal for feeds and chat lists.
 *
 * @example
 * formatRelativeTime(comment.createdAt); // '3 hours ago' / '3 jam yang lalu'
 */
export function formatRelativeTime(
  value: DateInput,
  options: LanguageOption & { addSuffix?: boolean } = {},
): string {
  const date = parseDate(value);

  if (!date) return EMPTY_VALUE;

  return formatDistanceToNow(date, {
    addSuffix: options.addSuffix ?? true,
    locale: getDateLocale(options.language),
  });
}

/**
 * Formats a phone number for display, grouping the national digits.
 * Use `parsePhone` instead when sending the number to an API.
 *
 * @example
 * formatPhone('081234567890'); // '+62 812-3456-7890'
 */
export function formatPhone(value: string, countryCode = "62"): string {
  const digits = value.replace(/\D/g, "");

  if (digits === "") return EMPTY_VALUE;

  const national = digits.startsWith(countryCode)
    ? digits.slice(countryCode.length)
    : digits.replace(/^0/, "");

  if (national === "") return `+${countryCode}`;

  const groups = [national.slice(0, 3), ...chunk(national.slice(3), 4)].filter(
    (group) => group !== "",
  );

  return `+${countryCode} ${groups.join("-")}`;
}

/**
 * Uppercases the first character and leaves the rest untouched.
 *
 * @example
 * capitalize('hello world'); // 'Hello world'
 */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Capitalizes every word.
 *
 * @example
 * titleCase('john doe'); // 'John Doe'
 */
export function titleCase(value: string): string {
  return words(value).map(capitalize).join(" ");
}

/**
 * @example
 * camelCase('user profile settings'); // 'userProfileSettings'
 */
export function camelCase(value: string): string {
  return words(value)
    .map((word, index) => (index === 0 ? word : capitalize(word)))
    .join("");
}

/**
 * @example
 * kebabCase('User Profile'); // 'user-profile'
 */
export function kebabCase(value: string): string {
  return words(value).join("-");
}

/**
 * @example
 * snakeCase('User Profile'); // 'user_profile'
 */
export function snakeCase(value: string): string {
  return words(value).join("_");
}

/**
 * Shortens text to a maximum length without cutting mid-word.
 *
 * @example
 * truncate('The quick brown fox jumps', 15); // 'The quick brown…'
 */
export function truncate(value: string, maxLength: number, suffix = "…"): string {
  if (value.length <= maxLength) return value;

  const sliced = value.slice(0, maxLength);

  // The cut already lands on a word boundary — no need to drop a whole word.
  if (value.charAt(maxLength) === " ") return sliced.trimEnd() + suffix;

  const lastSpace = sliced.lastIndexOf(" ");

  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trimEnd() + suffix;
}

/**
 * Builds avatar initials from a name.
 *
 * @example
 * getInitials('John Ronald Doe'); // 'JD'
 */
export function getInitials(value: string, maxLength = 2): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "";

  const selected =
    parts.length <= maxLength
      ? parts
      : [parts[0], ...parts.slice(-(maxLength - 1))];

  return selected
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, maxLength);
}

/**
 * Masks the middle of a string, keeping a few characters visible at each end.
 *
 * @example
 * maskString('4111111111111234', { visibleStart: 0, visibleEnd: 4 });
 * // '••••••••••••1234'
 */
export function maskString(
  value: string,
  options: { visibleStart?: number; visibleEnd?: number; maskChar?: string } = {},
): string {
  const { visibleStart = 2, visibleEnd = 2, maskChar = "•" } = options;

  if (value.length <= visibleStart + visibleEnd) {
    return maskChar.repeat(value.length);
  }

  const head = value.slice(0, visibleStart);
  const tail = visibleEnd === 0 ? "" : value.slice(-visibleEnd);
  const masked = maskChar.repeat(value.length - visibleStart - visibleEnd);

  return head + masked + tail;
}

/**
 * Masks the local part of an email while keeping the domain readable.
 *
 * @example
 * maskEmail('john.doe@example.com'); // 'jo••••••@example.com'
 */
export function maskEmail(value: string): string {
  const atIndex = value.lastIndexOf("@");

  if (atIndex <= 0) return maskString(value);

  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex);

  return maskString(local, { visibleStart: 2, visibleEnd: 0 }) + domain;
}

/**
 * Masks a phone number, keeping only the last digits visible.
 *
 * @example
 * maskPhone('081234567890'); // '••••••••7890'
 */
export function maskPhone(value: string, visibleEnd = 4): string {
  return maskString(value, { visibleStart: 0, visibleEnd });
}

/**
 * Masks a card number and groups it in blocks of four.
 *
 * @example
 * maskCardNumber('4111111111111234'); // '•••• •••• •••• 1234'
 */
export function maskCardNumber(value: string, visibleEnd = 4): string {
  const digits = value.replace(/\D/g, "");

  if (digits === "") return EMPTY_VALUE;

  return chunk(maskString(digits, { visibleStart: 0, visibleEnd }), 4).join(" ");
}

/** Splits a string into fixed-size chunks. */
function chunk(value: string, size: number): string[] {
  if (value === "") return [];

  return value.match(new RegExp(`.{1,${size}}`, "g")) ?? [value];
}

/** Splits any casing style into lowercase words. */
function words(value: string): string[] {
  return (
    value
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((word) => word.toLowerCase())
  );
}

