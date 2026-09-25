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

// Makes t() for a catalog. Falls back to English, then to the key itself.
export function makeTranslate(catalog = en) {
  return function t(key, values) {
    let text = lookup(catalog, key);
    if (typeof text !== "string") text = lookup(en, key);
    if (typeof text !== "string") return key;
    if (!values) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match));
  };
}
