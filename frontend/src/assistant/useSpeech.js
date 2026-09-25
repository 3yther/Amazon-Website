import { useCallback, useEffect, useRef } from "react";

// Where the accessibility settings are saved in the browser.
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

// Only uses voices on the device, so nothing Smiley says gets sent away.
function localVoice() {
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.localService);
  return (
    voices.find((voice) => voice.lang === "en-GB") ??
    voices.find((voice) => voice.lang?.startsWith("en")) ??
    null
  );
}

// Reads Smiley's messages out loud if text to speech is on.
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
