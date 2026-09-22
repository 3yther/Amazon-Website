import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// Where an in-app "Reduce motion" setting stores its answer. Nothing on the
// site writes this yet; the hook reads it so that when Settings does get built,
// every animation already follows it without being touched again. Write "true"
// or "false" here and fire a "tsmile:reduce-motion" event to update live.
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

/**
 * True when the visitor has asked for reduced motion, either in their system
 * settings or in the site's own setting. The site's setting wins, because
 * somebody who turns it on here means it here. Follows both live, so turning
 * either on mid-visit stops the animations straight away.
 */
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
