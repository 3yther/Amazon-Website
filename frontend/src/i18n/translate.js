import en from "./messages/en.js";

// The t() function, kept out of the React provider so plain modules and
// tests can use it too.

/** Reads "nav.home" out of a nested catalog. */
function lookup(catalog, key) {
  let value = catalog;
  for (const part of key.split(".")) {
    if (value == null) return undefined;
    value = value[part];
  }
  return value;
}

/**
 * Builds t() for a catalog: t("smiley.greeting", { name: "Sam" }) returns
 * the translated string with {name} filled in, falling back to English, then
 * to the key itself (which makes a missing string obvious on the page).
 */
export function makeTranslate(catalog = en) {
  return function t(key, values) {
    let text = lookup(catalog, key);
    if (typeof text !== "string") text = lookup(en, key);
    if (typeof text !== "string") return key;
    if (!values) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match));
  };
}
