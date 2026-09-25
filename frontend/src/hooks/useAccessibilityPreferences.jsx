import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getPreferences, updatePreferences } from "../api.js";
import { useAuth } from "../auth.jsx";
import ColourVisionFilters from "../components/ColourVisionFilters.jsx";
import { REDUCE_MOTION_EVENT, REDUCE_MOTION_KEY, useReducedMotion } from "../useReducedMotion.js";

const STORAGE_KEY = "tsmile:accessibility-preferences";

// Mirrors backend/accounts/models.py UserPreference, minus reduce_motion:
// that one keeps living in useReducedMotion.js's own key (see updatePreference
// below), so there is still exactly one place that stores it.
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

/**
 * Puts every preference where the rest of the site can see it: CSS custom
 * properties and classes on <html> and <body>, which the stylesheets then
 * read. Runs before the backend has confirmed anything, so the page always
 * feels instant.
 *
 * reduceMotion is passed separately because it has its own store (see
 * useReducedMotion.js) and its own answer, the site's setting or the
 * system's.
 */
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

  // Which colour-correction filter the page wears, read by styles.css. An
  // attribute rather than an inline filter so the stylesheet keeps saying
  // what the page looks like.
  const vision = preferences.color_blindness_type;
  if (COLOUR_VISION_TYPES.has(vision)) {
    root.dataset.colourVision = vision;
  } else {
    delete root.dataset.colourVision;
  }

  // The one switch every animation on the site answers to. CSS can only ask
  // the operating system through @media; this is how it gets told about the
  // site's own Reduce motion setting as well.
  root.dataset.motion = reduceMotion ? "reduced" : "full";
}

// Used by any page rendered without the provider (older tests, and anything
// mounted outside it): real defaults, and changing a preference is a no-op
// rather than a crash.
const FALLBACK = {
  preferences: { ...DEFAULT_PREFERENCES, reduce_motion: false },
  updatePreference: () => {},
  status: "idle",
};

const AccessibilityPreferencesContext = createContext(null);

/**
 * Holds the accessibility preferences for the whole app and keeps the
 * document in step with them.
 *
 * It lives at the root (main.jsx), not on the settings page, because the
 * settings have to apply on every page and survive a reload. While it was
 * mounted only inside the Accessibility page, a change took effect until you
 * refreshed and then quietly disappeared: the stored preference was still
 * right, but nothing was reading it any more.
 *
 * Every change applies to the page and saves to localStorage at once; a
 * signed-in user's changes also sync to their account, so the same
 * preferences follow them to another device. On load, a signed-in user's
 * saved preferences replace whatever localStorage had; signed out,
 * localStorage (or the defaults) is all there is.
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

/**
 * The current preferences, and a way to change one.
 *
 * Outside the provider it answers with the defaults and a no-op, so a
 * component (or a test) that renders on its own still works rather than
 * throwing.
 */
export function useAccessibilityPreferences() {
  return useContext(AccessibilityPreferencesContext) ?? FALLBACK;
}
