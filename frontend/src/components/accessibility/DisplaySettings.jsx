import { SelectField } from "../FormFields.jsx";

const THEMES = { light: "Light", dark: "Dark", system: "Match system" };
const OUTLINE_STYLES = { default: "Default", thick: "Thick", dashed: "Dashed" };
// Kept to light neutrals: --blue stays the text colour whatever background is
// picked here, and a dark background would leave dark text unreadable on it.
// Use the dark-mode theme above for a dark page.
const PAGE_BACKGROUNDS = { white: "White", cream: "Cream", gray: "Grey" };

/** Theme, focus outline style, and page background. */
export default function DisplaySettings({ preferences, updatePreference }) {
  return (
    <div className="settings-section">
      <p className="label">Display</p>

      <SelectField
        id="pref-theme"
        label="Theme"
        value={preferences.theme}
        onChange={(event) => updatePreference("theme", event.target.value)}
      >
        {Object.entries(THEMES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>

      <SelectField
        id="pref-outline-style"
        label="Focus outline style"
        value={preferences.button_outline_style}
        onChange={(event) => updatePreference("button_outline_style", event.target.value)}
      >
        {Object.entries(OUTLINE_STYLES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>

      <SelectField
        id="pref-page-background"
        label="Page background"
        value={preferences.page_background}
        onChange={(event) => updatePreference("page_background", event.target.value)}
      >
        {Object.entries(PAGE_BACKGROUNDS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
