import { useEffect, useId, useRef, useState } from "react";
import { Flag } from "./flags.jsx";
import { useI18n } from "./I18nProvider.jsx";
import { LANGUAGES } from "./languages.js";

// The language button next to the menu button in the header. It's the only
// language menu on the site apart from the setting on the Settings page.
//
// Each language has a small flag to help people spot theirs in a long list.
// Languages aren't countries, so the flag is only a visual aid: the language's
// own name is always written next to it, screen readers hear only that name,
// and a language with no single country gets a globe (see languages.js).
export default function LanguageMenu() {
  const { language, meta, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const focusCurrentOnOpen = useRef(false);
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

  // Opened with the arrow keys: start on the current language.
  useEffect(() => {
    if (!open || !focusCurrentOnOpen.current) return;
    focusCurrentOnOpen.current = false;
    const current = listRef.current?.querySelector('[aria-current="true"]');
    (current ?? listRef.current?.querySelector("button"))?.focus();
  }, [open]);

  function choose(code) {
    setLanguage(code);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onButtonKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusCurrentOnOpen.current = true;
      setOpen(true);
    }
  }

  // Up and down move through the languages, Home and End jump to the ends.
  function onListKeyDown(event) {
    const options = [...(listRef.current?.querySelectorAll("button") ?? [])];
    const index = options.indexOf(document.activeElement);
    const last = options.length - 1;
    const next = {
      ArrowDown: index < last ? index + 1 : 0,
      ArrowUp: index > 0 ? index - 1 : last,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    options[next]?.focus();
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
        onKeyDown={onButtonKeyDown}
      >
        <Flag country={meta.flag} />
        <span className="language-menu__code" aria-hidden="true">
          {language.toUpperCase()}
        </span>
      </button>

      {open && (
        <ul id={listId} ref={listRef} className="language-menu__list" onKeyDown={onListKeyDown}>
          {LANGUAGES.map((option) => (
            <li key={option.code}>
              <button
                type="button"
                className="language-menu__option"
                aria-current={option.code === language ? "true" : undefined}
                onClick={() => choose(option.code)}
              >
                <Flag country={option.flag} />
                {/* lang and dir on the name only, so the flags stay in one
                    column on the page's own reading side. */}
                <span lang={option.htmlLang} dir={option.dir}>
                  {option.native}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
