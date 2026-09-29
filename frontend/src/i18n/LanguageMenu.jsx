import { useEffect, useId, useRef, useState } from "react";
import { GlobeIcon } from "../components/Icons.jsx";
import { useI18n } from "./I18nProvider.jsx";
import { LANGUAGES } from "./languages.js";

// The language button next to the menu button in the header. It's the only
// language menu on the site apart from the setting on the Settings page.
// A globe, not a flag, because languages aren't countries.
export default function LanguageMenu() {
  const { language, meta, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listId = useId();

  // Close on a click outside or on Escape (which also puts focus back on the button).
  useEffect(() => {
    if (!open) return undefined;
    function onClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(code) {
    setLanguage(code);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div className="language-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="button language-menu__button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t("language.choose")}: ${meta.native}`}
        onClick={() => setOpen((current) => !current)}
      >
        <GlobeIcon />
        <span className="language-menu__code" aria-hidden="true">
          {language.toUpperCase()}
        </span>
      </button>

      {open && (
        <ul id={listId} className="language-menu__list">
          {LANGUAGES.map((option) => (
            <li key={option.code}>
              <button
                type="button"
                className="language-menu__option"
                lang={option.htmlLang}
                dir={option.dir}
                aria-current={option.code === language ? "true" : undefined}
                onClick={() => choose(option.code)}
              >
                {option.native}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
