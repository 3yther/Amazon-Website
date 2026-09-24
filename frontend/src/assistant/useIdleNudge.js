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
 * Calls onIdle once when the visitor has not interacted for delayMs on the
 * current page.
 *
 * Any interaction restarts the count. It fires at most once per page, and
 * changing page starts it again, so nobody gets nudged over and over.
 *
 * Everything here stays in the browser and is forgotten on navigation. No
 * timer, dwell time or mouse position is ever sent to the server, which is
 * what section 8 of the brief (and the mentor) asked for: behavioural signals
 * stay client side and ephemeral, and only the messages people actually type
 * are stored.
 *
 * WORTH TRYING LATER: the team's ideas document suggests that scrolling up and
 * down the same section, or bouncing between two pages, says more about being
 * stuck than sitting still does. Both are measurable here without sending
 * anything anywhere: count direction changes in the scroll handler, or count
 * how often the same pathname comes back. Left out for now to keep the rule
 * easy to explain to a visitor.
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
