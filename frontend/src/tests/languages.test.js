import { describe, expect, it } from "vitest";
import { FLAG_CODES } from "../i18n/flags.jsx";
import { LANGUAGES } from "../i18n/languages.js";

// The list of languages the menus are built from.

describe("languages", () => {
  it("has eighteen, English first, each code once", () => {
    expect(LANGUAGES).toHaveLength(18);
    expect(LANGUAGES[0].code).toBe("en");
    expect(new Set(LANGUAGES.map((language) => language.code)).size).toBe(LANGUAGES.length);
  });

  it.each(LANGUAGES.map((language) => [language.code, language]))("%s is complete", (code, language) => {
    expect(language.name).toBeTruthy();
    expect(language.native).toBeTruthy();
    // A real language tag, written the standard way (zh-Hans, not zh-hans).
    expect(Intl.getCanonicalLocales(language.htmlLang)).toEqual([language.htmlLang]);
    expect(["ltr", "rtl"]).toContain(language.dir);
    // A flag the site has, or null on purpose for a globe. Never missing.
    expect(Object.hasOwn(language, "flag")).toBe(true);
    if (language.flag !== null) expect(FLAG_CODES).toContain(language.flag);
  });

  it("writes Arabic and Urdu right to left, and nothing else", () => {
    const rtl = LANGUAGES.filter((language) => language.dir === "rtl").map((language) => language.code);
    expect(rtl.sort()).toEqual(["ar", "ur"]);
  });
});
