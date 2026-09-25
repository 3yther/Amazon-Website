// The languages T-SMILE is in: English plus the nine most spoken main languages
// in England after English (2021 Census). Arabic and Urdu are right to left.

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
