import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// Where the site's own "Reduce motion" setting is saved.
export const REDUCE_MOTION_KEY = "tsmile:reduce-motion";
export const REDUCE_MOTION_EVENT = "tsmile:reduce-motion";

/** The stored setting, or null when the visitor has not chosen one. */
function storedPreference() {
  try {
    const value = window.localStorage.getItem(REDUCE_MOTION_KEY);
    return value === null ? null : value === "true";
  } catch {
    // Private mode, or storage switched off. Fall back to the system setting.
    return null;
  }
}

function currentValue() {
  const stored = storedPreference();
  return stored === null ? window.matchMedia(QUERY).matches : stored;
}

// True if the visitor wants reduced motion, from their system or the site setting (the site setting wins).
export function useReducedMotion() {
  const [reduced, setReduced] = useState(currentValue);

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const update = () => setReduced(currentValue());
    update();

    query.addEventListener("change", update);
    // "storage" covers the setting being changed in another tab; the custom
    // event covers it being changed in this one.
    window.addEventListener("storage", update);
    window.addEventListener(REDUCE_MOTION_EVENT, update);

    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener("storage", update);
      window.removeEventListener(REDUCE_MOTION_EVENT, update);
    };
  }, []);

  return reduced;
}
