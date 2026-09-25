// Date and number formatting, always the UK way.

// A date as DD/MM/YYYY. Returns "" if the date is missing or invalid.
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
