import { useT } from "../../i18n/I18nProvider.jsx";
import { CheckboxField } from "../FormFields.jsx";

// The stored values; their names are in i18n/messages (settings.sight).
const COLOR_BLINDNESS_TYPES = ["none", "protanopia", "deuteranopia", "tritanopia"];

// text_spacing_level 0 to 3, in order.
const TEXT_SPACING_KEYS = ["normal", "comfortable", "relaxed", "wide"];

function RangeField({ id, label, value, valueLabel, ...inputProps }) {
  return (
    <div className="field">
      <div className="range-field__head">
        <label className="label" htmlFor={id}>
          {label}
        </label>
        <span className="range-field__value">{valueLabel}</span>
      </div>
      <input id={id} type="range" value={value} {...inputProps} />
    </div>
  );
}

// Font size, contrast, spacing, colour blindness, reduce motion and text to speech.
export default function SightLossSettings({ preferences, updatePreference }) {
  const t = useT();

  return (
    <div className="settings-section">
      <p className="label">{t("settings.tabs.sightLoss")}</p>

      <RangeField
        id="pref-font-scale"
        label={t("settings.sight.fontSize")}
        min={80}
        max={150}
        step={10}
        value={preferences.font_size_scale}
        valueLabel={`${preferences.font_size_scale}%`}
        onChange={(event) => updatePreference("font_size_scale", Number(event.target.value))}
      />

      <CheckboxField
        id="pref-high-contrast"
        label={t("settings.sight.highContrast")}
        checked={preferences.high_contrast}
        onChange={(event) => updatePreference("high_contrast", event.target.checked)}
      />

      <RangeField
        id="pref-text-spacing"
        label={t("settings.sight.textSpacing")}
        min={0}
        max={3}
        step={1}
        value={preferences.text_spacing_level}
        valueLabel={t(`settings.sight.spacing.${TEXT_SPACING_KEYS[preferences.text_spacing_level]}`)}
        onChange={(event) => updatePreference("text_spacing_level", Number(event.target.value))}
      />

      <div className="field">
        <label className="label" htmlFor="pref-color-blindness">
          {t("settings.sight.colourBlindness")}
        </label>
        <p className="field__hint" id="pref-color-blindness-hint">
          {t("settings.sight.colourBlindnessHint")}
        </p>
        <select
          id="pref-color-blindness"
          aria-describedby="pref-color-blindness-hint"
          value={preferences.color_blindness_type}
          onChange={(event) => updatePreference("color_blindness_type", event.target.value)}
        >
          {COLOR_BLINDNESS_TYPES.map((value) => (
            <option key={value} value={value}>
              {t(`settings.sight.colours.${value}`)}
            </option>
          ))}
        </select>
      </div>

      {/* This only reads out Smiley's replies, not the whole page. */}
      <CheckboxField
        id="pref-text-to-speech"
        label={t("settings.sight.speech")}
        hint={t("settings.sight.speechHint")}
        checked={preferences.text_to_speech}
        onChange={(event) => updatePreference("text_to_speech", event.target.checked)}
      />

      <CheckboxField
        id="pref-reduce-motion"
        label={t("settings.sight.reduceMotion")}
        hint={t("settings.sight.reduceMotionHint")}
        checked={preferences.reduce_motion}
        onChange={(event) => updatePreference("reduce_motion", event.target.checked)}
      />
    </div>
  );
}
