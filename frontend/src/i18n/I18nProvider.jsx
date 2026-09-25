import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getPreferences, updatePreferences } from "../api.js";
import { useAuth } from "../auth.jsx";
import { DEFAULT_LANGUAGE, isSupported, languageFor } from "./languages.js";
import en from "./messages/en.js";
import { makeTranslate } from "./translate.js";

// The site's translations.
//
// Every piece of interface text lives in messages/en.js under a key, e.g.
// "nav.home", and components ask for it with t("nav.home"). The other nine
// languages are separate files loaded only when somebody picks them, so an
// English visitor never downloads them. A key missing from a translation
// falls back to the English, so a half-finished language still works.
//
// The translations were written by machine, not by a translator, so every
// page says so and offers the English (see TranslationNotice.jsx). English is
// the version that counts.

// Where the choice is remembered in this browser. The account setting
// (UserPreference.language) is updated too, for signed-in visitors.
const STORAGE_KEY = "tsmile:language";

// Vite finds every language file here at build time and splits each into
// its own small download.
const CATALOGS = import.meta.glob(["./messages/*.js", "!./messages/en.js"]);

function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isSupported(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function storeLanguage(code) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Private mode or storage switched off: the choice lasts for this visit.
  }
}

const ENGLISH = {
  language: DEFAULT_LANGUAGE,
  meta: languageFor(DEFAULT_LANGUAGE),
  t: makeTranslate(en),
  setLanguage: () => {},
  ready: true,
};

// Components rendered without the provider (tests, mostly) get English.
const I18nContext = createContext(ENGLISH);

export function I18nProvider({ children }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState(readStoredLanguage);
  const [catalog, setCatalog] = useState(language === DEFAULT_LANGUAGE ? en : null);

  // Load the chosen language's file. English is already here.
  useEffect(() => {
    if (language === DEFAULT_LANGUAGE) {
      setCatalog(en);
      return undefined;
    }

    let cancelled = false;
    const load = CATALOGS[`./messages/${language}.js`];
    if (!load) {
      setCatalog(en);
      return undefined;
    }

    load()
      .then((module) => {
        if (!cancelled) setCatalog(module.default);
      })
      .catch(() => {
        if (!cancelled) setCatalog(en); // offline or blocked: English still works
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  // Tell the browser and screen readers which language the page is in, and
  // which way it reads.
  useEffect(() => {
    const meta = languageFor(language);
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
  }, [language]);

  // A signed-in visitor's saved language follows them to another device.
  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    getPreferences()
      .then((preferences) => {
        const saved = preferences?.language;
        if (!cancelled && isSupported(saved) && saved !== readStoredLanguage()) {
          storeLanguage(saved);
          setLanguageState(saved);
        }
      })
      .catch(() => {}); // keep whatever this browser had
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setLanguage = useCallback(
    (code) => {
      if (!isSupported(code)) return;
      storeLanguage(code);
      setLanguageState(code);
      if (user) updatePreferences({ language: code }).catch(() => {});
    },
    [user],
  );

  const value = useMemo(() => {
    const active = catalog ?? en;
    return {
      language,
      meta: languageFor(language),
      t: makeTranslate(active),
      setLanguage,
      // False for the moment between choosing a language and its file arriving.
      ready: catalog !== null,
    };
  }, [catalog, language, setLanguage]);

  return <I18nContext value={value}>{children}</I18nContext>;
}

/** { language, meta, t, setLanguage, ready } */
export function useI18n() {
  return useContext(I18nContext);
}

/** Just the t() function, for components that only need text. */
export function useT() {
  return useContext(I18nContext).t;
}
