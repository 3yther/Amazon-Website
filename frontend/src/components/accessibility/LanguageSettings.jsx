import { SelectField } from "../FormFields.jsx";

// Only English is actually translated today; the rest are placeholders so the
// control is ready once full i18n is built (Phase 2 follow-up).
const LANGUAGES = {
  en: "English",
  es: "Spanish (coming soon)",
  fr: "French (coming soon)",
  ur: "Urdu (coming soon)",
};

/**
 * Interface language. The control saves, but nothing is translated behind it
 * yet, which is what its hint says. Dates and numbers are always written the
 * UK way (see formats.js), so they have no setting.
 */
export default function LanguageSettings({ preferences, updatePreference }) {
  return (
    <div className="settings-section">
      <p className="label">Language</p>

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
    </div>
  );
}
