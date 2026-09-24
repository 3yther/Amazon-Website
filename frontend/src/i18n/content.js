import { useEffect, useState } from "react";
import * as aboutEnglish from "../aboutContent.js";
import * as amazonEnglish from "../amazonContent.js";
import * as helpEnglish from "../helpContent.js";
import * as interestEnglish from "../interestContent.js";
import * as quizEnglish from "../knowledgeQuizQuestions.js";
import { useI18n } from "./I18nProvider.jsx";

// The page copy (aboutContent.js, amazonContent.js, helpContent.js,
// interestContent.js and the quiz questions) in the visitor's language.
//
// English stays in those files, unchanged: they are the checked source,
// and Smiley's backend facts are quoted from them word for word. Each other
// language has one file in ./content/ holding only the WORDS, in the same
// shape. Icons, links, slugs and numbers come from the English file, so a
// translation can never break a link or change a figure by accident.
//
// Anything a translation leaves out falls back to the English.

const ENGLISH = {
  about: aboutEnglish,
  amazon: amazonEnglish,
  help: helpEnglish,
  interest: interestEnglish,
  quiz: quizEnglish,
};

const TRANSLATIONS = import.meta.glob("./content/*.js");

/**
 * One list: item by item, the translated words laid over the English item.
 * A list inside an item (a quiz question's options) is merged the same way,
 * so a translation only has to give the words, never the values or scores.
 * null or a missing entry keeps the English.
 */
function mergeList(english, translated) {
  if (!Array.isArray(translated)) return english;
  return english.map((item, index) => {
    const words = translated[index];
    if (words === undefined || words === null) return item;
    if (typeof item === "string" || typeof words === "string") return words;
    const merged = { ...item };
    for (const [key, value] of Object.entries(words)) {
      merged[key] = Array.isArray(item[key]) ? mergeList(item[key], value) : value;
    }
    return merged;
  });
}

function mergeModule(english, translated) {
  if (!translated) return english;
  const merged = {};
  for (const [name, value] of Object.entries(english)) {
    const words = translated[name];
    if (Array.isArray(value)) merged[name] = mergeList(value, words);
    else if (typeof value === "string" && typeof words === "string") merged[name] = words;
    else merged[name] = value;
  }
  return merged;
}

export function mergeContent(translated) {
  if (!translated) return ENGLISH;
  const merged = {};
  for (const [name, english] of Object.entries(ENGLISH)) {
    merged[name] = mergeModule(english, translated[name]);
  }
  return merged;
}

const loaded = new Map([["en", ENGLISH]]);

/**
 * { about, amazon, help, interest, quiz } in the current language. Returns the English
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
