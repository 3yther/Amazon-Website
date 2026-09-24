import { useI18n } from "../../i18n/I18nProvider.jsx";
import { LANGUAGES } from "../../i18n/languages.js";
import { SelectField } from "../FormFields.jsx";

// The interface language is the same setting as the language menu in the
// header and the side menu (see i18n/I18nProvider.jsx), so changing it in any
// of the three changes all of them, and it is saved to the account too.

const DATE_FORMATS = {
  "DD/MM/YYYY": "31/01/2026 (DD/MM/YYYY)",
  "MM/DD/YYYY": "01/31/2026 (MM/DD/YYYY)",
  "YYYY-MM-DD": "2026-01-31 (YYYY-MM-DD)",
};

const NUMBER_FORMATS = {
  UK: "1,234.56 (UK)",
  US: "1,234.56 (US)",
  EU: "1.234,56 (EU)",
};

/** Interface language, date format and number format. */
export default function LanguageSettings({ preferences, updatePreference }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="settings-section">
      <p className="label">Language and region</p>

      <SelectField
        id="pref-language"
        label={t("language.settingLabel")}
        hint={t("language.settingHint")}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {LANGUAGES.map((option) => (
          <option key={option.code} value={option.code} lang={option.htmlLang}>
            {option.native}
            {option.code !== "en" ? ` (${option.name})` : ""}
          </option>
        ))}
      </SelectField>

      <SelectField
        id="pref-date-format"
        label="Date format"
        value={preferences.date_format}
        onChange={(event) => updatePreference("date_format", event.target.value)}
      >
        {Object.entries(DATE_FORMATS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>

      <SelectField
        id="pref-number-format"
        label="Number format"
        value={preferences.number_format}
        onChange={(event) => updatePreference("number_format", event.target.value)}
      >
        {Object.entries(NUMBER_FORMATS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
