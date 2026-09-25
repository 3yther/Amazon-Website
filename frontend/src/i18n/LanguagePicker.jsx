import { useId } from "react";
import { GlobeIcon } from "../components/Icons.jsx";
import { useI18n } from "./I18nProvider.jsx";
import { LANGUAGES } from "./languages.js";

/**
 * The language menu: a plain <select>, because it is the one control every
 * keyboard, screen reader and phone already knows how to use.
 *
 * Each language is listed in its own name (Polski, العربية), which is what
 * somebody who reads it will look for, and each option carries its own lang
 * attribute so a screen reader pronounces it in the right voice.
 *
 * Shown in the account menu and the side menu, always with its label.
 */
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
