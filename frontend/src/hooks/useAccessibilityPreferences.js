import { useCallback, useEffect, useMemo, useState } from "react";
import { getPreferences, updatePreferences } from "../api.js";
import { useAuth } from "../auth.jsx";
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
  date_format: "MM/DD/YYYY",
  number_format: "US",
};

const TEXT_SPACING_VALUES = ["normal", "0.02em", "0.05em", "0.1em"];

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

// Puts a preference where the rest of the site can see it, before the
// backend has confirmed anything, so the page always feels instant.
function applyToDocument(preferences) {
  document.documentElement.style.setProperty("--font-scale", String(preferences.font_size_scale / 100));
  document.documentElement.style.setProperty(
    "--text-spacing",
    TEXT_SPACING_VALUES[preferences.text_spacing_level] ?? "normal",
  );
  document.body.classList.toggle("high-contrast", preferences.high_contrast);
  document.body.dataset.pageBackground = preferences.page_background;
  document.body.dataset.outlineStyle = preferences.button_outline_style;

  const isDark =
    preferences.theme === "dark" ||
    (preferences.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark-mode", isDark);
  // Set even when false, so an explicit "light" choice overrides the
  // prefers-color-scheme fallback in styles.css while the OS itself is dark.
  document.documentElement.classList.toggle("light-mode", !isDark);
}

/**
 * Reads and writes accessibility preferences. Every change applies to the
 * page and saves to localStorage at once; a signed-in user's changes also
 * sync to their account, so the same preferences follow them to another
 * device. On load, a signed-in user's saved preferences replace whatever
 * localStorage had; signed out, localStorage (or these defaults) is all
 * there is.
 */
export function useAccessibilityPreferences() {
  const { user, checked } = useAuth();
  const reduceMotion = useReducedMotion();
  const [preferences, setPreferences] = useState(readStored);
  const [status, setStatus] = useState("idle"); // idle | saving | error

  useEffect(() => {
    if (!checked || !user) return;
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
    applyToDocument(preferences);
  }, [preferences]);

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

  return useMemo(
    () => ({ preferences: { ...preferences, reduce_motion: reduceMotion }, updatePreference, status }),
    [preferences, reduceMotion, updatePreference, status],
  );
}
