import { useState } from "react";
import { Link } from "react-router-dom";
import { useT } from "../i18n/I18nProvider.jsx";

// A one-time note about cookies. The site only uses the cookies it needs to
// work (sign-in and CSRF), so it's a notice, not a consent banner.
const SEEN_KEY = "tsmile:cookie-notice";

function alreadySeen() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "seen";
  } catch {
    return false;
  }
}

export default function CookieNotice() {
  const t = useT();
  const [open, setOpen] = useState(() => !alreadySeen());

  if (!open) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(SEEN_KEY, "seen");
    } catch {
      // storage switched off: it just shows again next visit
    }
    setOpen(false);
  }

  return (
    <section className="cookie-notice" aria-label={t("cookieNotice.label")}>
      <p>
        {t("cookieNotice.text")} <Link to="/cookies">{t("cookieNotice.link")}</Link>
      </p>
      <button type="button" className="button button--primary" onClick={dismiss}>
        {t("cookieNotice.ok")}
      </button>
    </section>
  );
}
