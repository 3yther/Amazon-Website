import { useI18n } from "../../i18n/I18nProvider.jsx";
import { LANGUAGES } from "../../i18n/languages.js";
import { SelectField } from "../FormFields.jsx";

// Same setting as the language picker in the account menu and side menu.

// Interface language. Dates and numbers are always UK style (see formats.js).
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
