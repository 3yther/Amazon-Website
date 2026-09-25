import { useId } from "react";
import { GlobeIcon } from "../components/Icons.jsx";
import { useI18n } from "./I18nProvider.jsx";
import { LANGUAGES } from "./languages.js";

// The language dropdown. Each language is shown in its own name.
export default function LanguagePicker() {
  const { language, setLanguage, t } = useI18n();
  const id = useId();

  return (
    <div className="language-picker">
      <label htmlFor={id} className="language-picker__label">
        {t("language.label")}
      </label>
      <div className="language-picker__control">
        <GlobeIcon />
        <select
          id={id}
          className="language-picker__select"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          {LANGUAGES.map((option) => (
            <option key={option.code} value={option.code} lang={option.htmlLang}>
              {option.native}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
