import { CheckboxField } from "../FormFields.jsx";

const COLOR_BLINDNESS_TYPES = {
  none: "None",
  protanopia: "Protanopia (red-blind)",
  deuteranopia: "Deuteranopia (green-blind)",
  tritanopia: "Tritanopia (blue-blind)",
};

const TEXT_SPACING_LABELS = ["Normal", "Comfortable", "Relaxed", "Wide"];

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

/**
 * Font size, contrast, text spacing, colour-vision correction and the chat
 * assistant's voice: the settings someone with low vision or colour blindness
 * is most likely to need. Reduce motion lives here too, reusing the same
 * preference useReducedMotion.js already reads everywhere else on the site.
 */
export default function SightLossSettings({ preferences, updatePreference }) {
  return (
    <div className="settings-section">
      <p className="label">Sight and vision</p>

      <RangeField
        id="pref-font-scale"
        label="Font size"
        min={80}
        max={150}
        step={10}
        value={preferences.font_size_scale}
        valueLabel={`${preferences.font_size_scale}%`}
        onChange={(event) => updatePreference("font_size_scale", Number(event.target.value))}
      />

      <CheckboxField
        id="pref-high-contrast"
        label="High contrast"
        checked={preferences.high_contrast}
        onChange={(event) => updatePreference("high_contrast", event.target.checked)}
      />

      <RangeField
        id="pref-text-spacing"
        label="Text spacing"
        min={0}
        max={3}
        step={1}
        value={preferences.text_spacing_level}
        valueLabel={TEXT_SPACING_LABELS[preferences.text_spacing_level]}
        onChange={(event) => updatePreference("text_spacing_level", Number(event.target.value))}
      />

      <div className="field">
        <label className="label" htmlFor="pref-color-blindness">
          Colour blindness type
        </label>
        <p className="field__hint" id="pref-color-blindness-hint">
          Tell us how you see colour and the site adjusts its own, so shades that would look
          alike to you are pulled apart.
        </p>
        <select
          id="pref-color-blindness"
          aria-describedby="pref-color-blindness-hint"
          value={preferences.color_blindness_type}
          onChange={(event) => updatePreference("color_blindness_type", event.target.value)}
        >
          {Object.entries(COLOR_BLINDNESS_TYPES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Named for what it actually does. It used to say "Read page content
          aloud", which promised a screen reader for the whole site; all it
          drives is Smiley's replies (assistant/useSpeech.js). Reading the
          page itself is still to build, so the label says so rather than
          leaving someone to find out by turning it on. */}
      <CheckboxField
        id="pref-text-to-speech"
        label="Read the chat assistant's replies aloud"
        hint="Speaks Smiley's answers only, using a voice on this device. The rest of the page is not read aloud yet."
        checked={preferences.text_to_speech}
        onChange={(event) => updatePreference("text_to_speech", event.target.checked)}
      />

      <CheckboxField
        id="pref-reduce-motion"
        label="Reduce motion"
        hint="Turns off the site's animations, on top of your system setting."
        checked={preferences.reduce_motion}
        onChange={(event) => updatePreference("reduce_motion", event.target.checked)}
      />
    </div>
  );
}
