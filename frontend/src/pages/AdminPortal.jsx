import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { adminPortalLock, adminPortalStatus, adminPortalUnlock } from "../api.js";
import { useAuth } from "../auth.jsx";
import FilterBar from "../components/admin/FilterBar.jsx";
import Overview from "../components/admin/Overview.jsx";
import Sidebar, { NAV_IDS } from "../components/admin/Sidebar.jsx";
import useDashboardFilters from "../components/admin/useDashboardFilters.js";
import { FormError } from "../components/FormFields.jsx";
import {
  FeedbackTab,
  InterestTab,
  PeopleTab,
  PostsTab,
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

/** Which sections can be exported, and from where. */
const EXPORTS = {
  overview: "/api/accounts/admin-portal/dashboard/export/",
  people: "/api/accounts/admin-portal/people/export/",
};

/**
 * Which part of the greeting to use. Split at 12 and 18, the same boundaries
 * the words themselves imply; a dashboard opened at 02:00 says evening rather
 * than guessing at something cleverer.
 */
function greetingKey(hour) {
  if (hour < 12) return "admin.greeting.morning";
  if (hour < 18) return "admin.greeting.afternoon";
  return "admin.greeting.evening";
}

/**
 * What to call somebody in the greeting.
 *
 * The username, because there is no first name to use: sign-up never asks for
 * one (CONTEXT.md's rule is to hold the minimum) and neither Profile nor the
 * /me/ payload carries a name. Adding a real name to greet people by would
 * mean collecting one from every account on the site, which is a much bigger
 * decision than a nicer heading.
 */
function greetingNameOf(user) {
  return user?.username || "";
}

export default function AdminPortal() {
  const t = useT();
  const { user, checked } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, range, setFilter, clearAll, anySet, asQueryString } = useDashboardFilters();

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
  const activeId = NAV_IDS.includes(requested) ? requested : "overview";
  const setActiveId = (id) => {
    // The other filters survive a move between sections, so narrowing to 90
    // days on the Overview and then opening People keeps the 90 days.
    const next = new URLSearchParams(searchParams);
    if (id === "overview") next.delete("tab");
    else next.set("tab", id);
    setSearchParams(next, { replace: true });
  };

  const panels = {
    overview: <Overview filters={filters} />,
    interest: <InterestTab />,
    reports: <ReportsTab />,
    posts: <PostsTab />,
    feedback: <FeedbackTab />,
    people: <PeopleTab />,
  };

  return (
    <div className="admin-shell">
      <Sidebar activeId={activeId} onChange={setActiveId} onLock={relock} />

      <div className="admin-main">
        <header className="admin-head">
          <p className="label">{t("account.roles.amazon_staff")}</p>
          <h1 id="page-title">
            {t(greetingKey(new Date().getHours()), { name: greetingNameOf(user) })}
          </h1>
          <p className="lead">{t("admin.lead")}</p>
        </header>

        {/* One filter bar for the whole dashboard, so a range chosen here
            means the same thing on every section and in every export. */}
        <FilterBar
          filters={filters}
          range={range}
          setFilter={setFilter}
          clearAll={clearAll}
          anySet={anySet}
          exportUrl={EXPORTS[activeId]}
          exportQuery={asQueryString}
        />

        <main className="admin-panel" aria-labelledby="page-title">
          {panels[activeId]}
        </main>
      </div>
    </div>
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
