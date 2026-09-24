import { SelectField } from "../FormFields.jsx";

// Only English is actually translated today; the rest are placeholders so the
// control is ready once full i18n is built (Phase 2 follow-up).
const LANGUAGES = {
  en: "English",
  es: "Spanish (coming soon)",
  fr: "French (coming soon)",
  ur: "Urdu (coming soon)",
};

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
  return (
    <div className="settings-section">
      <p className="label">Language and region</p>

      <SelectField
        id="pref-language"
        label="Interface language"
        hint="Only English is fully translated so far."
        value={preferences.language}
        onChange={(event) => updatePreference("language", event.target.value)}
      >
        {Object.entries(LANGUAGES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
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
