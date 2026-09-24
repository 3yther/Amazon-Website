import { useI18n } from "./I18nProvider.jsx";

// Pages whose text is legal wording. They stay in English whatever language is
// chosen, because a machine translation of a legal document is not something
// anybody should rely on.
export const ENGLISH_ONLY_PATHS = new Set(["/terms", "/privacy", "/cookies", "/data-rights"]);

/**
 * A short, honest line under the header whenever the site is not in English:
 * this was translated by machine, and English is the version that counts.
 * The way back to English is also written in English, so it can be found
 * even if the translation around it is poor.
 */
export default function TranslationNotice({ pathname }) {
  const { language, meta, t, setLanguage } = useI18n();
  if (language === "en") return null;

  const englishOnly = ENGLISH_ONLY_PATHS.has(pathname);

  return (
    <div className="translation-notice" role="note">
      <div className="container translation-notice__inner">
        <p>
          {englishOnly
            ? t("translation.englishOnly")
            : t("translation.notice", { language: meta.native })}
        </p>
        <button type="button" className="translation-notice__button" onClick={() => setLanguage("en")}>
          {t("translation.showEnglish")}
          <span lang="en-GB"> (Read in English)</span>
        </button>
      </div>
    </div>
  );
}
