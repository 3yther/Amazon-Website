import { useEffect, useState } from "react";
import * as aboutEnglish from "../aboutContent.js";
import * as amazonEnglish from "../amazonContent.js";
import * as helpEnglish from "../helpContent.js";
import * as interestEnglish from "../interestContent.js";
import * as legalEnglish from "../legalContent.js";
import * as quizEnglish from "../knowledgeQuizQuestions.js";
import { useI18n } from "./I18nProvider.jsx";

// The page copy (aboutContent.js, amazonContent.js, helpContent.js,
// interestContent.js, legalContent.js and the quiz questions) in the
// visitor's language.
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
  legal: legalEnglish,
  quiz: quizEnglish,
};

const TRANSLATIONS = import.meta.glob("./content/*.js");

/**
 * Lays the translated words over the English, whatever the shape: a list item
 * by item, an object key by key, a string swapped for its translation. So a
 * list inside an item (a quiz question's options) or a whole page object (a
 * legal page with its sections) is merged the same way, and a translation
 * only ever gives the words. Anything that is not a string in the English
 * (numbers, scores, null) always comes from the English, as does anything a
 * translation leaves out or sets to null.
 */
function mergeValue(english, words) {
  if (words === undefined || words === null) return english;
  if (Array.isArray(english)) {
    if (!Array.isArray(words)) return english;
    return english.map((item, index) => mergeValue(item, words[index]));
  }
  if (english !== null && typeof english === "object") {
    if (typeof words !== "object" || Array.isArray(words)) return english;
    const merged = {};
    for (const [key, value] of Object.entries(english)) merged[key] = mergeValue(value, words[key]);
    return merged;
  }
  if (typeof english === "string" && typeof words === "string") return words;
  return english;
}

function mergeModule(english, translated) {
  if (!translated) return english;
  const merged = {};
  for (const [name, value] of Object.entries(english)) merged[name] = mergeValue(value, translated[name]);
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
 * { about, amazon, help, interest, legal, quiz } in the current language. Returns the English
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
