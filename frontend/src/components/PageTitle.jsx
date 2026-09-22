import { useEffect } from "react";

const SITE_NAME = "T-SMILE";

/**
 * Gives the page it wraps its own browser tab title, e.g. "Log in | T-SMILE",
 * so every route says what it is (WCAG 2.4.2 Page Titled). Used on each route
 * in App.jsx. The previous title comes back when the page unmounts.
 */
export default function PageTitle({ title, children }) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | ${SITE_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return children;
}
