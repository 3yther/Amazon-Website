import { useI18n } from "./I18nProvider.jsx";

// Pages that are only in English. The staff page is just for Amazon staff.
const ENGLISH_ONLY_PATHS = new Set(["/staff"]);

// A line under the header when the site isn't in English, saying it was
// machine translated. "Read in English" is always in English so it can be found.
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
