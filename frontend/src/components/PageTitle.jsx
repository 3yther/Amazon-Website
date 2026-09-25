import { useEffect } from "react";
import { useT } from "../i18n/I18nProvider.jsx";

const SITE_NAME = "T-SMILE";

// Sets the browser tab title for the page, e.g. "Login | T-SMILE".
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
