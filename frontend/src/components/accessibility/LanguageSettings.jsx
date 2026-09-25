import { useI18n } from "../../i18n/I18nProvider.jsx";
import { LANGUAGES } from "../../i18n/languages.js";
import { SelectField } from "../FormFields.jsx";

// The interface language is the same setting as the language menu in the
// header and the side menu (see i18n/I18nProvider.jsx), so changing it in any
// of the three changes all of them, and it is saved to the account too.

/**
 * Interface language. Dates and numbers are always written the UK way (see
 * formats.js), so they have no setting.
 */
export default function LanguageSettings() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="settings-section">
      <p className="label">{t("language.label")}</p>

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
    </div>
  );
}
