import { useEffect, useState } from "react";
import * as aboutEnglish from "../aboutContent.js";
import * as amazonEnglish from "../amazonContent.js";
import * as helpEnglish from "../helpContent.js";
import { useI18n } from "./I18nProvider.jsx";

// The page copy (aboutContent.js, amazonContent.js, helpContent.js) in the
// visitor's language.
//
// English stays in those three files, unchanged: they are the checked source,
// and Smiley's backend facts are quoted from them word for word. Each other
// language has one file in ./content/ holding only the WORDS, in the same
// shape. Icons, links, slugs and numbers come from the English file, so a
// translation can never break a link or change a figure by accident.
//
// Anything a translation leaves out falls back to the English.

const ENGLISH = { about: aboutEnglish, amazon: amazonEnglish, help: helpEnglish };

const TRANSLATIONS = import.meta.glob("./content/*.js");

/** One list: item by item, the translated words laid over the English item. */
function mergeList(english, translated) {
  if (!Array.isArray(translated)) return english;
  return english.map((item, index) => {
    const words = translated[index];
    if (words === undefined || words === null) return item;
    if (typeof item === "string" || typeof words === "string") return words;
    return { ...item, ...words };
  });
}

function mergeModule(english, translated) {
  if (!translated) return english;
  const merged = {};
  for (const [name, value] of Object.entries(english)) {
    merged[name] = Array.isArray(value) ? mergeList(value, translated[name]) : value;
  }
  return merged;
}

export function mergeContent(translated) {
  if (!translated) return ENGLISH;
  return {
    about: mergeModule(ENGLISH.about, translated.about),
    amazon: mergeModule(ENGLISH.amazon, translated.amazon),
    help: mergeModule(ENGLISH.help, translated.help),
  };
}

const loaded = new Map([["en", ENGLISH]]);

/**
 * { about, amazon, help } in the current language. Returns the English
 * straight away and swaps in the translation once its file has loaded.
 */
export function useSiteContent() {
  const { language } = useI18n();
  const [content, setContent] = useState(() => loaded.get(language) ?? ENGLISH);

  useEffect(() => {
    if (loaded.has(language)) {
      setContent(loaded.get(language));
      return undefined;
    }

    const load = TRANSLATIONS[`./content/${language}.js`];
    if (!load) {
      setContent(ENGLISH);
      return undefined;
    }

    let cancelled = false;
    load()
      .then((module) => {
        const merged = mergeContent(module.default);
        loaded.set(language, merged);
        if (!cancelled) setContent(merged);
      })
      .catch(() => {
        if (!cancelled) setContent(ENGLISH);
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  return content;
}
