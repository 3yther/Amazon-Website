import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { onEasterEgg } from "./assistantBus.js";

// Easter eggs: peek, bottom of page, party (Konami code), offline/online and
// clicking the logo 5 times. This hook spots them and ChatWidget reacts.
// Nothing is sent or saved.

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

const PEEK_CHECK_MS = 20000;
const PEEK_MIN_GAP_MS = 90000;
const PEEK_MAX_GAP_MS = 180000;
const MAX_PEEKS = 3;
const RECENTLY_ACTIVE_MS = 15000;

export function useEasterEggs({ onEgg, canPeek }) {
  const { pathname } = useLocation();
  const onEggRef = useRef(onEgg);
  const canPeekRef = useRef(canPeek);
  const bottomSeen = useRef(new Set());

  useEffect(() => {
    onEggRef.current = onEgg;
    canPeekRef.current = canPeek;
  });

  const fire = (type) => onEggRef.current?.(type);

  // The Konami code.
  useEffect(() => {
    let position = 0;
    const handleKey = (event) => {
      const key = event.key?.toLowerCase();
      position = key === KONAMI[position] ? position + 1 : key === KONAMI[0] ? 1 : 0;
      if (position === KONAMI.length) {
        position = 0;
        fire("party");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Losing and finding the connection.
  useEffect(() => {
    const offline = () => fire("offline");
    const online = () => fire("online");
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);

  // Other parts of the site announcing an easter egg (the wordmark).
  useEffect(() => onEasterEgg((type) => fire(type)), []);

  // Reaching the bottom of a long page, once per page per visit.
  useEffect(() => {
    let frame = null;
    const check = () => {
      frame = null;
      const page = document.documentElement;
      const long = page.scrollHeight > window.innerHeight * 2;
      const atBottom = window.scrollY + window.innerHeight >= page.scrollHeight - 48;
      if (long && atBottom && !bottomSeen.current.has(pathname)) {
        bottomSeen.current.add(pathname);
        fire("bottom");
      }
    };
    const handleScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(check);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // Peekaboo: only while somebody is actively browsing, never while the chat
  // is open, and only a few times a visit.
  useEffect(() => {
    let lastActivity = Date.now();
    let nextPeekAt = Date.now() + PEEK_MIN_GAP_MS;
    let peeks = 0;

    const markActive = () => {
      lastActivity = Date.now();
    };

    const check = () => {
      const now = Date.now();
      if (peeks >= MAX_PEEKS || now < nextPeekAt) return;
      if (now - lastActivity > RECENTLY_ACTIVE_MS || !canPeekRef.current) return;
      peeks += 1;
      nextPeekAt = now + PEEK_MIN_GAP_MS + Math.random() * (PEEK_MAX_GAP_MS - PEEK_MIN_GAP_MS);
      fire("peek");
    };

    for (const event of ["mousemove", "scroll", "keydown", "touchstart"]) {
      window.addEventListener(event, markActive, { passive: true });
    }
    const interval = window.setInterval(check, PEEK_CHECK_MS);
    return () => {
      for (const event of ["mousemove", "scroll", "keydown", "touchstart"]) {
        window.removeEventListener(event, markActive);
      }
      window.clearInterval(interval);
    };
  }, []);
}
