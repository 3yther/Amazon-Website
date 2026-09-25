// Turning the Language and region settings into actual output.
//
// Both settings used to be stored, synced and shown, and then read by
// nothing: whichever date format you picked, every date on the site still
// came out in the browser's own. These are the functions that make the
// choice visible, and the only ones that should format a date or a number.

// How to lay out each stored date format. Written out rather than handed to
// a locale, because a locale brings its own habits with it: en-US drops the
// leading zero and prints 1/31/2026, while the setting's own option says
// 01/31/2026. What is on the settings page is what should appear.
const DATE_PATTERNS = {
  "DD/MM/YYYY": (d, m, y) => `${d}/${m}/${y}`,
  "MM/DD/YYYY": (d, m, y) => `${m}/${d}/${y}`,
  "YYYY-MM-DD": (d, m, y) => `${y}-${m}-${d}`,
};

const DEFAULT_DATE_PATTERN = DATE_PATTERNS["DD/MM/YYYY"];

const NUMBER_LOCALES = {
  UK: "en-GB", // 1,234.56
  US: "en-US", // 1,234.56
  EU: "de-DE", // 1.234,56
};

/**
 * A date in the visitor's chosen format, e.g. "31/01/2026".
 *
 * Takes anything new Date() takes. Returns "" for a missing or unparseable
 * value, so a half-loaded profile prints nothing rather than "Invalid Date".
 */
export function formatDate(value, dateFormat) {
  if (value === null || value === undefined || value === "") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  // Local parts, so a timestamp stored in UTC shows the day it was here.
  const pad = (n) => String(n).padStart(2, "0");
  const pattern = DATE_PATTERNS[dateFormat] ?? DEFAULT_DATE_PATTERN;
  return pattern(pad(date.getDate()), pad(date.getMonth() + 1), date.getFullYear());
}

/**
 * A number in the visitor's chosen format, e.g. "1,234" or "1.234".
 *
 * UK and US agree below a decimal point, so this only looks different from
 * the default once a number reaches a thousand.
 */
export function formatNumber(value, numberFormat) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return value.toLocaleString(NUMBER_LOCALES[numberFormat] ?? "en-GB");
}
