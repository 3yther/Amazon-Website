import { useCallback, useEffect, useRef } from "react";

// Where the Accessibility settings page keeps its choices (see
// hooks/useAccessibilityPreferences.js). Read directly rather than through
// that hook, because the hook also syncs with the server and one copy of it
// running on the settings page is enough.
const PREFERENCES_KEY = "tsmile:accessibility-preferences";

/** True when the visitor turned on "Text to speech" in Accessibility settings. */
function speechWanted() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) ?? "{}");
    return stored.text_to_speech === true;
  } catch {
    return false;
  }
}

/**
 * A voice that runs on this device. Some browsers offer online voices that
 * send the text away to be spoken; those are skipped on purpose, so nothing
 * Smiley says leaves the browser. British English first, then any English.
 */
function localVoice() {
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.localService);
  return (
    voices.find((voice) => voice.lang === "en-GB") ??
    voices.find((voice) => voice.lang?.startsWith("en")) ??
    null
  );
}

/**
 * Reads Smiley's messages aloud when the visitor has turned text to speech on,
 * and tells Smiley when it is talking so its mouth can move.
 */
export function useSpeech({ onStart, onEnd }) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const handlers = useRef({ onStart, onEnd });

  useEffect(() => {
    handlers.current = { onStart, onEnd };
  }, [onStart, onEnd]);

  useEffect(() => {
    if (!supported) return undefined;
    // Some browsers load their voice list late. Asking once warms it up.
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", warm);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    handlers.current.onEnd?.();
  }, [supported]);

  const speak = useCallback(
    (text) => {
      if (!supported || !text || !speechWanted()) return;
      const voice = localVoice();
      if (!voice) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.onstart = () => handlers.current.onStart?.();
      utterance.onend = () => handlers.current.onEnd?.();
      utterance.onerror = () => handlers.current.onEnd?.();
      window.speechSynthesis.speak(utterance);
    },
    [supported],
  );

  return { speak, stop };
}
