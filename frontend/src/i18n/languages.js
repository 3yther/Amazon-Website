// The languages T-SMILE is available in.
//
// English plus the nine most common main languages in England after English,
// from the 2021 Census (ONS): Polish, Romanian, Panjabi, Urdu, Portuguese,
// Spanish, Arabic, Bengali and Gujarati, in that order. T Levels only exist in
// England, so these are the languages of the families who will actually use
// the site, rather than the world's most spoken languages.
//
// code     what the site stores and sends (matches UserPreference.language)
// name     the language's name in English, for staff and screen readers
// native   the language's name in itself, which is what a reader looks for
// htmlLang the value for <html lang>, so screen readers pick the right voice
// dir      "rtl" for Arabic and Urdu, which are written right to left
//
// Panjabi is written in Gurmukhi here. Many UK Panjabi speakers of Pakistani
// heritage read Shahmukhi (Arabic script) instead, and most of them also read
// Urdu, which is on the list.

export const LANGUAGES = [
  { code: "en", name: "English", native: "English", htmlLang: "en-GB", dir: "ltr" },
  { code: "pl", name: "Polish", native: "Polski", htmlLang: "pl", dir: "ltr" },
  { code: "ro", name: "Romanian", native: "Română", htmlLang: "ro", dir: "ltr" },
  { code: "pa", name: "Panjabi", native: "ਪੰਜਾਬੀ", htmlLang: "pa-Guru", dir: "ltr" },
  { code: "ur", name: "Urdu", native: "اردو", htmlLang: "ur", dir: "rtl" },
  { code: "pt", name: "Portuguese", native: "Português", htmlLang: "pt-PT", dir: "ltr" },
  { code: "es", name: "Spanish", native: "Español", htmlLang: "es", dir: "ltr" },
  { code: "ar", name: "Arabic", native: "العربية", htmlLang: "ar", dir: "rtl" },
  { code: "bn", name: "Bengali", native: "বাংলা", htmlLang: "bn", dir: "ltr" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", htmlLang: "gu", dir: "ltr" },
];

export const DEFAULT_LANGUAGE = "en";

const BY_CODE = new Map(LANGUAGES.map((language) => [language.code, language]));

/** The language record for a code, or English if the code is unknown. */
export function languageFor(code) {
  return BY_CODE.get(code) ?? BY_CODE.get(DEFAULT_LANGUAGE);
}

export function isSupported(code) {
  return BY_CODE.has(code);
}
