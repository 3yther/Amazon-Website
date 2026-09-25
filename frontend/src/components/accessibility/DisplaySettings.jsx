import { useT } from "../../i18n/I18nProvider.jsx";
import { SelectField } from "../FormFields.jsx";

// The stored values; their names are in i18n/messages (settings.display).
const THEMES = ["light", "dark", "system"];
const OUTLINE_STYLES = ["default", "thick", "dashed"];
// Light colours only, because the text stays dark. Use dark mode for a dark page.
const PAGE_BACKGROUNDS = ["white", "cream", "gray"];

/** Theme, focus outline style, and page background. */
export default function DisplaySettings({ preferences, updatePreference }) {
  const t = useT();

  return (
    <div className="settings-section">
      <p className="label">{t("settings.tabs.display")}</p>

      <SelectField
        id="pref-theme"
        label={t("settings.display.theme")}
        value={preferences.theme}
        onChange={(event) => updatePreference("theme", event.target.value)}
      >
        {THEMES.map((value) => (
          <option key={value} value={value}>
            {t(`settings.display.themes.${value}`)}
          </option>
        ))}
      </SelectField>

      <SelectField
        id="pref-outline-style"
        label={t("settings.display.outline")}
        value={preferences.button_outline_style}
        onChange={(event) => updatePreference("button_outline_style", event.target.value)}
      >
        {OUTLINE_STYLES.map((value) => (
          <option key={value} value={value}>
            {t(`settings.display.outlines.${value}`)}
          </option>
        ))}
      </SelectField>

      <SelectField
        id="pref-page-background"
        label={t("settings.display.background")}
        value={preferences.page_background}
        onChange={(event) => updatePreference("page_background", event.target.value)}
      >
        {PAGE_BACKGROUNDS.map((value) => (
          <option key={value} value={value}>
            {t(`settings.display.backgrounds.${value}`)}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
