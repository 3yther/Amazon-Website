import { describe, expect, it } from "vitest";
import en from "../i18n/messages/en.js";
import { LANGUAGES } from "../i18n/languages.js";
import { mergeContent } from "../i18n/content.js";
import { TOPICS_BY_ID } from "../assistant/answers/topics.js";

// Checks every translation has every English key, and keeps the same
// {placeholders} and numbers.

const CATALOGS = import.meta.glob("../i18n/messages/*.js", { eager: true });
const CONTENT = import.meta.glob("../i18n/content/*.js", { eager: true });
const OTHERS = LANGUAGES.filter((language) => language.code !== "en").map((language) => language.code);

/** Every string in a catalog, by its dotted path. Lists count as one entry each. */
function leaves(value, path = "", found = new Map()) {
  if (typeof value === "string") found.set(path, value);
  else if (Array.isArray(value)) value.forEach((item, index) => leaves(item, `${path}[${index}]`, found));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) leaves(child, path ? `${path}.${key}` : key, found);
  }
  return found;
}

const placeholders = (text) => (text.match(/\{\w+\}/g) ?? []).sort();

/** The figures in a string, with thousands separators taken out: "1,100" and "1.100" both give "1100". */
const figures = (text) => (text.replace(/(\d)[,.](?=\d{3}(?!\d))/g, "$1").match(/\d+/g) ?? []).sort();

const english = leaves(en);

describe.each(OTHERS)("%s interface strings", (code) => {
  const catalog = CATALOGS[`../i18n/messages/${code}.js`]?.default;
  const translated = catalog ? leaves(catalog) : new Map();

  it("exists", () => {
    expect(catalog).toBeTruthy();
  });

  it("has every English string", () => {
    const missing = [...english.keys()].filter((path) => !translated.has(path));
    expect(missing).toEqual([]);
  });

  it("has nothing English does not, apart from Smiley's keywords", () => {
    const extra = [...translated.keys()].filter(
      (path) => !english.has(path) && !path.startsWith("smiley.keywords."),
    );
    expect(extra).toEqual([]);
  });

  it("keeps every {placeholder} and every figure", () => {
    const changed = [];
    for (const [path, text] of english) {
      const words = translated.get(path);
      if (words === undefined) continue;
      if (placeholders(words).join() !== placeholders(text).join()) changed.push(`${path}: placeholders`);
      if (figures(words).join() !== figures(text).join()) changed.push(`${path}: figures`);
    }
    expect(changed).toEqual([]);
  });

  it("only gives keywords for topics Smiley has", () => {
    const unknown = Object.keys(catalog?.smiley?.keywords ?? {}).filter((id) => !TOPICS_BY_ID.has(id));
    expect(unknown).toEqual([]);
  });
});

const ENGLISH_CONTENT = mergeContent(null);

/** Every string field of every list item, with where it came from. */
function contentStrings(content) {
  const found = new Map();
  for (const [module, lists] of Object.entries(content)) {
    for (const [name, value] of Object.entries(lists)) leaves(value, `${module}.${name}`, found);
  }
  return found;
}

describe.each(OTHERS)("%s page copy", (code) => {
  const file = CONTENT[`../i18n/content/${code}.js`]?.default;
  const merged = mergeContent(file);

  it("exists", () => {
    expect(file).toBeTruthy();
  });

  it("translates each list item by item, no more and no fewer", () => {
    const wrong = [];
    for (const [module, lists] of Object.entries(file ?? {})) {
      for (const [name, value] of Object.entries(lists)) {
        const source = ENGLISH_CONTENT[module]?.[name];
        if (source === undefined) wrong.push(`${module}.${name} is not in the English`);
        else if (Array.isArray(source) && value.length !== source.length) wrong.push(`${module}.${name} length`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it("keeps every figure the English has", () => {
    const source = contentStrings(ENGLISH_CONTENT);
    const changed = [];
    for (const [path, words] of contentStrings(merged)) {
      const text = source.get(path);
      if (text === undefined) changed.push(`${path}: not in the English`);
      else if (figures(words).join() !== figures(text).join()) changed.push(`${path}: figures`);
    }
    expect(changed).toEqual([]);
  });

  it("keeps the links, icons, slugs, values and scores from the English", () => {
    const strip = (list) => JSON.stringify(list, (key, value) => (typeof value === "string" && !/^(icon|slug|value|to|href|number|points|id|year)$/.test(key) && key !== "" ? "" : value));
    for (const [module, lists] of Object.entries(ENGLISH_CONTENT)) {
      for (const [name, value] of Object.entries(lists)) {
        if (value !== null && typeof value === "object") {
          expect(strip(merged[module][name]), `${module}.${name}`).toBe(strip(value));
        }
      }
    }
  });

  it("translates every word on the page", () => {
    // Everything a visitor reads, except what stays English on purpose: links
    // and values, official qualification and grade names, and source titles.
    const KEPT = /(^|\.)(icon|slug|value|to|href|url|number|points|id|year)$|SOURCES\[|\.tLevels\[|^about\.GRADES\[[0-2]\]\.grade$/;
    const words = contentStrings(file ?? {});
    const missing = [...contentStrings(ENGLISH_CONTENT).keys()].filter((path) => !KEPT.test(path) && !words.has(path));
    expect(missing).toEqual([]);
  });

  it("only gives words the English has somewhere to go", () => {
    // A mistyped key would be dropped without a word, and the English shown.
    const source = contentStrings(ENGLISH_CONTENT);
    const stray = [...contentStrings(file ?? {}).keys()].filter((path) => !source.has(path));
    expect(stray).toEqual([]);
  });

  it("gives every quiz question a right answer that is one of its options", () => {
    for (const question of merged.quiz.KNOWLEDGE_QUESTIONS) {
      expect(question.options, question.id).toContain(question.correctAnswer);
    }
  });

  it("still does not claim a Finance placement at Amazon", () => {
    const finance = merged.about.PATHWAYS.find((pathway) => pathway.slug === "finance");
    expect(finance.amazonStatus).toBeNull();
  });
});
