// How the site writes a date or a number. Always the UK forms: T-SMILE is a
// UK site for UK students, so there is no setting for it. These are the only
// functions that should format a date or a number, so it stays consistent.

/**
 * A date as DD/MM/YYYY, e.g. "31/01/2026".
 *
 * Written out rather than left to toLocaleDateString, which follows the
 * browser's language and would print 1/31/2026 on a US-set machine.
 * Takes anything new Date() takes. Returns "" for a missing or unparseable
 * value, so a half-loaded profile prints nothing rather than "Invalid Date".
 */
export function formatDate(value) {
  if (value === null || value === undefined || value === "") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  // Local parts, so a timestamp stored in UTC shows the day it was here.
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** A number with UK separators, e.g. "1,234" or "1,234.56". */
export function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return value.toLocaleString("en-GB");
}
