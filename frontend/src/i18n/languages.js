// The languages T-SMILE is in. English first, then the nine most spoken main
// languages in England after English (2021 Census), in that order. Then eight
// more that were asked for, in alphabetical order of their English names.
// Arabic and Urdu are right to left.
//
// flag is the country whose flag appears next to the language in the menu
// (see flags.jsx). It is a convention to help people spot their language
// quickly, not a claim about where a language belongs: the language's own
// name is always shown next to it. null means no flag fits and the menu shows
// a globe instead:
//   en  United Kingdom (the site uses UK English, dates and spelling)
//   ar  globe: Arabic is the main language of more than twenty countries
//   pa  India (Punjabi is also spoken in Pakistan)
//   ur  Pakistan
//   bn  Bangladesh (Bengali is also spoken in India)
//   gu  India
//   pt  Portugal (the site uses European Portuguese)
//   es  Spain
//   zh  China (Mandarin, in simplified characters)
//   hi  India
//   ha, yo  Nigeria
//   the rest: the country the language is named after

export const LANGUAGES = [
  { code: "en", name: "English", native: "English", htmlLang: "en-GB", dir: "ltr", flag: "gb" },
  { code: "pl", name: "Polish", native: "Polski", htmlLang: "pl", dir: "ltr", flag: "pl" },
  { code: "ro", name: "Romanian", native: "Română", htmlLang: "ro", dir: "ltr", flag: "ro" },
  { code: "pa", name: "Panjabi", native: "ਪੰਜਾਬੀ", htmlLang: "pa-Guru", dir: "ltr", flag: "in" },
  { code: "ur", name: "Urdu", native: "اردو", htmlLang: "ur", dir: "rtl", flag: "pk" },
  { code: "pt", name: "Portuguese", native: "Português", htmlLang: "pt-PT", dir: "ltr", flag: "pt" },
  { code: "es", name: "Spanish", native: "Español", htmlLang: "es", dir: "ltr", flag: "es" },
  { code: "ar", name: "Arabic", native: "العربية", htmlLang: "ar", dir: "rtl", flag: null },
  { code: "bn", name: "Bengali", native: "বাংলা", htmlLang: "bn", dir: "ltr", flag: "bd" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", htmlLang: "gu", dir: "ltr", flag: "in" },
  { code: "zh", name: "Chinese (Mandarin)", native: "中文（普通话）", htmlLang: "zh-Hans", dir: "ltr", flag: "cn" },
  { code: "fr", name: "French", native: "Français", htmlLang: "fr", dir: "ltr", flag: "fr" },
  { code: "de", name: "German", native: "Deutsch", htmlLang: "de", dir: "ltr", flag: "de" },
  { code: "ha", name: "Hausa", native: "Hausa", htmlLang: "ha", dir: "ltr", flag: "ng" },
  { code: "hi", name: "Hindi", native: "हिन्दी", htmlLang: "hi", dir: "ltr", flag: "in" },
  { code: "it", name: "Italian", native: "Italiano", htmlLang: "it", dir: "ltr", flag: "it" },
  { code: "ru", name: "Russian", native: "Русский", htmlLang: "ru", dir: "ltr", flag: "ru" },
  { code: "yo", name: "Yoruba", native: "Yorùbá", htmlLang: "yo", dir: "ltr", flag: "ng" },
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
