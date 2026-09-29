import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { adminPortalLock, adminPortalStatus, adminPortalUnlock } from "../api.js";
import { useAuth } from "../auth.jsx";
import TabNav from "../components/TabNav.jsx";
import { FormError } from "../components/FormFields.jsx";
import {
  FeedbackTab,
  InterestTab,
  OverviewTab,
  PeopleTab,
  ReportsTab,
} from "../components/admin/Tabs.jsx";
import { formErrors } from "../formErrors.js";
import { useT } from "../i18n/I18nProvider.jsx";

// The Admin Portal (/admin-portal), reached from the footer link on every page.
//
// TWO GATES, AND THEY ARE NOT THE SAME GATE.
//
// Being signed in as Amazon staff is the real one, and it is enforced on every
// endpoint by the server. What happens below is only so somebody who cannot
// get in gets something sensible instead of an empty page full of errors; the
// same "not a security boundary, just a good experience" note the old /staff
// page carried applies here unchanged. It splits in two, because being signed
// out and being signed in as a student are different problems: the first is
// probably a staff member who has not signed in yet and needs telling, the
// second is somebody who has no business here and needs no explanation.
//
// The PIN on top is a screen-lock for a shared staff laptop. It is checked
// server-side, rate limited, and it expires, but it is deliberately NOT the
// thing keeping anybody out: a correct PIN on a student account still gets
// 403 from every endpoint behind it.

const TAB_IDS = ["overview", "interest", "reports", "feedback", "people"];

export default function AdminPortal() {
  const t = useT();
  const { user, checked } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [lock, setLock] = useState(null); // { unlocked, configured, minutes }
  const [asking, setAsking] = useState(true);

  const isStaff = user?.user_type === "amazon_staff";

  useEffect(() => {
    if (!isStaff) return undefined;

    let cancelled = false;
    adminPortalStatus()
      .then((result) => !cancelled && setLock(result))
      .catch(() => !cancelled && setLock({ unlocked: false, configured: true }))
      .finally(() => !cancelled && setAsking(false));

    return () => {
      cancelled = true;
    };
  }, [isStaff]);

  const relock = useCallback(async () => {
    await adminPortalLock().catch(() => {});
    setLock((current) => ({ ...current, unlocked: false }));
  }, []);

  // Nothing until the first session check, so a staff member is never bounced
  // in the moment before we know who they are.
  if (!checked) return null;
  if (!user) return <SignInGate />;
  if (!isStaff) return <Navigate to="/" replace />;
  if (asking) return null;

  if (!lock?.unlocked) {
    return <PinGate lock={lock} onUnlocked={() => setLock({ ...lock, unlocked: true })} />;
  }

  const requested = searchParams.get("tab");
  const activeId = TAB_IDS.includes(requested) ? requested : "overview";
  const setActiveId = (id) =>
    setSearchParams(id === "overview" ? {} : { tab: id }, { replace: true });

  const tabs = [
    { id: "overview", label: t("admin.tabs.overview"), content: <OverviewTab /> },
    { id: "interest", label: t("admin.tabs.interest"), content: <InterestTab /> },
    { id: "reports", label: t("admin.tabs.reports"), content: <ReportsTab /> },
    { id: "feedback", label: t("admin.tabs.feedback"), content: <FeedbackTab /> },
    { id: "people", label: t("admin.tabs.people"), content: <PeopleTab /> },
  ];

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("account.roles.amazon_staff")}</p>
        <h1 id="page-title">{t("admin.title")}</h1>
        <p className="lead">{t("admin.lead")}</p>
        <p>
          <button type="button" className="button" onClick={relock}>
            {t("admin.lockAgain")}
          </button>
        </p>
      </section>

      <TabNav tabs={tabs} activeId={activeId} onChange={setActiveId} />
    </>
  );
}

/**
 * The signed-out screen, for a staff member who has not signed in yet. Laid
 * out like PinGate so the portal's gates look like each other.
 *
 * The link carries ?next= so signing in comes back here rather than dropping
 * them on the homepage, and it is built from the current location so a link to
 * a particular tab survives the round trip.
 */
function SignInGate() {
  const t = useT();
  const location = useLocation();
  const next = encodeURIComponent(`${location.pathname}${location.search}`);

  return (
    <section className="admin-pin" aria-labelledby="page-title">
      <p className="label">{t("account.roles.amazon_staff")}</p>
      <h1 id="page-title">{t("admin.signedOut.title")}</h1>
      <p className="lead">{t("admin.signedOut.lead")}</p>
      <p>
        <Link className="button button--primary" to={`/login?next=${next}`}>
          {t("account.signIn")}
        </Link>
      </p>
    </section>
  );
}

/**
 * The PIN screen. One field rather than four boxes: the site has no segmented
 * input anywhere, and four boxes would mean inventing focus-hopping,
 * paste-splitting and backspace behaviour that a plain numeric field already
 * gets right. inputMode="numeric" still brings up a keypad on a phone.
 */
function PinGate({ lock, onUnlocked }) {
  const t = useT();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const field = useRef(null);

  useEffect(() => {
    field.current?.focus();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminPortalUnlock(pin);
      onUnlocked();
    } catch (caught) {
      // The server says only "that PIN is not right": no count of attempts
      // left, because that tells a guesser how close they are.
      const found = formErrors(caught, t);
      setError(found.pin ?? found.form ?? t("admin.pin.wrong"));
      setPin("");
      field.current?.focus();
      setBusy(false);
    }
  }

  if (lock && lock.configured === false) {
    return (
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("account.roles.amazon_staff")}</p>
        <h1 id="page-title">{t("admin.title")}</h1>
        <FormError message={t("admin.pin.notSetUp")} />
      </section>
    );
  }

  return (
    <section className="admin-pin" aria-labelledby="page-title">
      <p className="label">{t("account.roles.amazon_staff")}</p>
      <h1 id="page-title">{t("admin.pin.title")}</h1>
      <p className="lead">{t("admin.pin.lead")}</p>

      <form className="account-form admin-pin__form" onSubmit={submit} noValidate>
        <div className="field">
          <label className="label" htmlFor="admin-pin">
            {t("admin.pin.label")}
          </label>
          <p className="field__hint" id="admin-pin-hint">
            {t("admin.pin.hint")}
          </p>
          <input
            id="admin-pin"
            ref={field}
            className="admin-pin__input"
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "admin-pin-hint admin-pin-error" : "admin-pin-hint"}
          />
          {error && (
            <p className="field__error" id="admin-pin-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="button button--primary"
          disabled={busy || pin.length < 4}
        >
          {busy ? t("admin.pin.checking") : t("admin.pin.submit")}
        </button>
      </form>
    </section>
  );
}
