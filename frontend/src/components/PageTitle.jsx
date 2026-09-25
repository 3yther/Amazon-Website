import { useEffect } from "react";
import { useT } from "../i18n/I18nProvider.jsx";

const SITE_NAME = "T-SMILE";

/**
 * Gives the page it wraps its own browser tab title, e.g. "Log in | T-SMILE",
 * so every route says what it is (WCAG 2.4.2 Page Titled). Used on each route
 * in App.jsx. The previous title comes back when the page unmounts.
 *
 * The title is translated when the catalog has it (i18n/messages, titles,
 * keyed by the English title), and stays as given otherwise.
 */
export default function PageTitle({ title, children }) {
  const t = useT();
  const key = `titles.${title}`;
  const translated = t(key);
  const shown = translated === key ? title : translated;

  useEffect(() => {
    const previous = document.title;
    document.title = `${shown} | ${SITE_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [shown]);

  return children;
}
