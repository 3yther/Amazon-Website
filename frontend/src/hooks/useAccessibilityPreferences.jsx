import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getPreferences, updatePreferences } from "../api.js";
import { useAuth } from "../auth.jsx";
import ColourVisionFilters from "../components/ColourVisionFilters.jsx";
import { REDUCE_MOTION_EVENT, REDUCE_MOTION_KEY, useReducedMotion } from "../useReducedMotion.js";

const STORAGE_KEY = "tsmile:accessibility-preferences";

// Same as UserPreference in backend/accounts/models.py, except reduce motion (see useReducedMotion.js).
export const DEFAULT_PREFERENCES = {
  font_size_scale: 100,
  high_contrast: false,
  text_spacing_level: 0,
  color_blindness_type: "none",
  text_to_speech: false,
  theme: "system",
  button_outline_style: "default",
  page_background: "white",
  language: "en",
};

const TEXT_SPACING_VALUES = ["normal", "0.02em", "0.05em", "0.1em"];

// The types ColourVisionFilters.jsx draws a filter for. Anything else, "none"
// included, means no filter at all.
const COLOUR_VISION_TYPES = new Set(["protanopia", "deuteranopia", "tritanopia"]);

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    // Private mode, storage switched off, or corrupt JSON: use the defaults.
    return DEFAULT_PREFERENCES;
  }
}

function writeStored(preferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Private mode, or storage switched off. Preferences still apply for this visit.
  }
}

// Puts the settings onto <html> and <body> as classes and CSS variables for the stylesheets.
function applyToDocument(preferences, reduceMotion) {
  const root = document.documentElement;

  root.style.setProperty("--font-scale", String(preferences.font_size_scale / 100));
  root.style.setProperty(
    "--text-spacing",
    TEXT_SPACING_VALUES[preferences.text_spacing_level] ?? "normal",
  );
  document.body.classList.toggle("high-contrast", preferences.high_contrast);
  document.body.dataset.pageBackground = preferences.page_background;
  document.body.dataset.outlineStyle = preferences.button_outline_style;

  const isDark =
    preferences.theme === "dark" ||
    (preferences.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark-mode", isDark);
  // Set even when false, so an explicit "light" choice overrides the
  // prefers-color-scheme fallback in styles.css while the OS itself is dark.
  root.classList.toggle("light-mode", !isDark);

  // Which colour blindness filter to use (read by styles.css).
  const vision = preferences.color_blindness_type;
  if (COLOUR_VISION_TYPES.has(vision)) {
    root.dataset.colourVision = vision;
  } else {
    delete root.dataset.colourVision;
  }

  // So CSS knows about the site's own Reduce motion setting, not just the system one.
  root.dataset.motion = reduceMotion ? "reduced" : "full";
}

// Defaults for anything rendered without the provider (like some tests).
const FALLBACK = {
  preferences: { ...DEFAULT_PREFERENCES, reduce_motion: false },
  updatePreference: () => {},
  status: "idle",
};

const AccessibilityPreferencesContext = createContext(null);

/**
 * Holds the accessibility settings for the whole site. Changes save to
 * localStorage straight away, and to the account if you're signed in.
 */
export function AccessibilityPreferencesProvider({ children }) {
  const { user, checked } = useAuth();
  const reduceMotion = useReducedMotion();
  const [preferences, setPreferences] = useState(readStored);
  const [status, setStatus] = useState("idle"); // idle | saving | error

  useEffect(() => {
    if (!checked || !user) return undefined;
    let cancelled = false;

    getPreferences()
      .then((remote) => {
        if (cancelled || !remote) return;
        const merged = { ...DEFAULT_PREFERENCES, ...remote };
        setPreferences(merged);
        writeStored(merged);
      })
      .catch(() => {
        // Backend unreachable or not signed in after all: keep localStorage/defaults.
      });

    return () => {
      cancelled = true;
    };
  }, [checked, user]);

  useEffect(() => {
    applyToDocument(preferences, reduceMotion);
  }, [preferences, reduceMotion]);

  // The theme can be "system", so a change to the operating system's own
  // setting has to repaint the page even though no preference changed.
  useEffect(() => {
    if (preferences.theme !== "system") return undefined;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => applyToDocument(preferences, reduceMotion);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [preferences, reduceMotion]);

  const updatePreference = useCallback(
    (key, value) => {
      // Kept in useReducedMotion.js's own key so there is one source of
      // truth; the hook picks the change up through its own event listener.
      if (key === "reduce_motion") {
        try {
          window.localStorage.setItem(REDUCE_MOTION_KEY, String(value));
        } catch {
          // Private mode, or storage switched off.
        }
        window.dispatchEvent(new Event(REDUCE_MOTION_EVENT));
        return;
      }

      setPreferences((current) => {
        const next = { ...current, [key]: value };
        writeStored(next);
        return next;
      });

      if (user) {
        setStatus("saving");
        updatePreferences({ [key]: value })
          .then(() => setStatus("idle"))
          .catch(() => setStatus("error"));
      }
    },
    [user],
  );

  const value = useMemo(
    () => ({ preferences: { ...preferences, reduce_motion: reduceMotion }, updatePreference, status }),
    [preferences, reduceMotion, updatePreference, status],
  );

  return (
    <AccessibilityPreferencesContext.Provider value={value}>
      <ColourVisionFilters />
      {children}
    </AccessibilityPreferencesContext.Provider>
  );
}

// The current settings and a way to change one.
export function useAccessibilityPreferences() {
  return useContext(AccessibilityPreferencesContext) ?? FALLBACK;
}
