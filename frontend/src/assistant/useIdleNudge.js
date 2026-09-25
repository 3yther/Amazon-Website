import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// How long somebody has to go quiet before the assistant offers help. Sixty
// seconds, from the team's ideas document.
export const IDLE_MS = 60000;

// How often we check. Checking a stored timestamp on an interval is much
// cheaper than clearing and resetting a timer on every mouse move.
const CHECK_MS = 5000;

// What counts as still being here. All passive: none of them block scrolling.
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "focusin"];

/**
 * Calls onIdle once if the visitor does nothing for delayMs on a page.
 * Starts again on a new page. Nothing is sent to the server.
 */
export function useIdleNudge({ enabled, onIdle, delayMs = IDLE_MS }) {
  const { pathname } = useLocation();
  // Held in a ref so a re-render does not restart the count.
  const lastActivity = useRef(Date.now());
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return undefined;

    let fired = false;
    lastActivity.current = Date.now();

    const markActive = () => {
      lastActivity.current = Date.now();
    };

    const check = () => {
      if (fired || Date.now() - lastActivity.current < delayMs) return;
      fired = true;
      onIdleRef.current();
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActive, { passive: true });
    }
    const interval = window.setInterval(check, CHECK_MS);

    return () => {
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, markActive);
      window.clearInterval(interval);
    };
    // pathname is in here on purpose: a new page starts a fresh count.
  }, [enabled, delayMs, pathname]);
}

// What Smiley says when a page goes quiet lives in smileyScript.js (nudgeForPath).
