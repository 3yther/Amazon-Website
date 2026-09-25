import { useEffect, useState } from "react";
import * as aboutEnglish from "../aboutContent.js";
import * as amazonEnglish from "../amazonContent.js";
import * as helpEnglish from "../helpContent.js";
import * as interestEnglish from "../interestContent.js";
import * as legalEnglish from "../legalContent.js";
import * as quizEnglish from "../knowledgeQuizQuestions.js";
import { useI18n } from "./I18nProvider.jsx";

// The page content (aboutContent.js etc.) in the visitor's language.
// Each language file in ./content/ only has the words. Links, icons and numbers
// always come from the English, and anything missing falls back to English.

const ENGLISH = {
  about: aboutEnglish,
  amazon: amazonEnglish,
  help: helpEnglish,
  interest: interestEnglish,
  legal: legalEnglish,
  quiz: quizEnglish,
};

const TRANSLATIONS = import.meta.glob("./content/*.js");

// Puts the translated words over the English. Only strings get replaced.
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

// The site content in the current language. English first, then the translation once it loads.
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
