import { useCallback, useEffect, useRef, useState } from "react";
import { adminChangeRole, adminPerson, adminSendPasswordReset } from "../../api.js";
import { formatDate } from "../../formats.js";
import { useT } from "../../i18n/I18nProvider.jsx";
import { ErrorState, Skeleton } from "./States.jsx";

/**
 * One account, in a panel beside the list.
 *
 * A real dialog, which means three things the browser will not do for a <div>:
 * focus moves into it when it opens and back to where it came from when it
 * closes, Tab stays inside while it is open, and Escape closes it. Without the
 * first and last, somebody using a keyboard opens this and is stranded behind
 * it with no way back.
 *
 * NO EMAIL, still. The People table deliberately shows none, and opening a
 * drawer is not a reason to widen what the site hands out about people aged
 * 16 to 18. Search may match on an address, because narrowing a list is not
 * the same as publishing one, but nothing here displays it.
 */

const ROLES = ["student", "parent", "teacher"];

export default function PersonDrawer({ personId, onClose, onChanged }) {
  const t = useT();
  const panel = useRef(null);
  // Where focus was before this opened, so it can be given back.
  const opener = useRef(null);

  const [person, setPerson] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [busy, setBusy] = useState("");
  const [said, setSaid] = useState("");

  const load = useCallback(() => {
    setStatus("loading");
    adminPerson(personId)
      .then((result) => {
        setPerson(result);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [personId]);

  useEffect(load, [load]);

  useEffect(() => {
    opener.current = document.activeElement;
    // Focus the panel itself rather than the first control: a screen reader
    // then reads the heading, so it is clear what just opened.
    panel.current?.focus();

    return () => {
      // Back where it came from. Without this, focus falls to the top of the
      // document and a keyboard user has to tab the whole page again.
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, []);

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    // Keep Tab inside. The browser has no idea this is meant to be modal.
    // Not filtered by offsetParent: jsdom computes no layout, so that is
    // always null under test and the trap would quietly do nothing there,
    // which is exactly where it gets tested. Everything in this panel is
    // visible while it is open; a disabled control is the only thing Tab
    // skips anyway.
    const focusable = [
      ...panel.current.querySelectorAll(
        'button, a[href], select, input, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => !element.disabled && !element.hidden);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const here = document.activeElement;

    // Focus starts on the panel itself, which is not in the list because it is
    // tabindex="-1". Without this, the first Tab walks out into the page
    // behind rather than into the panel's own controls.
    if (!focusable.includes(here)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && here === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && here === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function changeRole(userType) {
    setBusy("role");
    setSaid("");
    try {
      await adminChangeRole(person.id, userType);
      setPerson((current) => ({ ...current, user_type: userType }));
      setSaid(t("admin.person.roleChanged"));
      onChanged?.();
    } catch {
      setSaid(t("admin.actionFailed"));
    } finally {
      setBusy("");
    }
  }

  async function sendReset() {
    setBusy("reset");
    setSaid("");
    try {
      await adminSendPasswordReset(person.id);
      // Deliberately does not say whether an address existed: the server does
      // not tell us, on purpose, so neither does this.
      setSaid(t("admin.person.resetSent"));
    } catch {
      setSaid(t("admin.actionFailed"));
    } finally {
      setBusy("");
    }
  }

  const isStaff = person?.user_type === "amazon_staff" || person?.is_superuser;

  return (
    <div className="admin-drawer__backdrop" onClick={onClose} role="presentation">
      <aside
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        ref={panel}
        onKeyDown={onKeyDown}
        /* The backdrop closes on click; the panel must not pass its own
           clicks up to it. */
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-drawer__head">
          <h2 id="drawer-title">{person?.username ?? t("admin.person.title")}</h2>
          <button type="button" className="button" onClick={onClose}>
            {t("admin.person.close")}
          </button>
        </div>

        {status === "error" && <ErrorState onRetry={load} />}
        {status === "loading" && <Skeleton lines={4} />}

        {status === "ready" && person && (
          <>
            <dl className="admin-drawer__facts">
              {[
                ["type", t(`account.roles.${person.user_type}`)],
                ["pathway", person.pathway || t("admin.person.none")],
                ["joined", formatDate(person.date_joined)],
                [
                  "lastLogin",
                  person.last_login ? formatDate(person.last_login) : t("admin.person.never"),
                ],
                ["questions", person.questions],
                ["answers", person.answers],
                ["reports", person.reports_made],
                ["feedback", person.feedback_sent],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt className="label">{t(`admin.person.${key}`)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <section aria-labelledby="drawer-actions">
              <h3 id="drawer-actions">{t("admin.person.actions")}</h3>

              {isStaff ? (
                /* Staff are not moved from here, in either direction. Taking
                   admin access away is its own deliberate step in the list. */
                <p className="admin-drawer__note">{t("admin.person.staffNote")}</p>
              ) : (
                <div className="admin-drawer__action">
                  <label className="label" htmlFor="drawer-role">
                    {t("admin.person.changeRole")}
                  </label>
                  <select
                    id="drawer-role"
                    value={person.user_type}
                    disabled={busy === "role"}
                    onChange={(event) => changeRole(event.target.value)}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {t(`account.roles.${role}`)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="admin-drawer__action">
                <button
                  type="button"
                  className="button"
                  disabled={busy === "reset"}
                  onClick={sendReset}
                >
                  {busy === "reset" ? t("admin.working") : t("admin.person.sendReset")}
                </button>
              </div>

              {/* Announced, so somebody who cannot see the panel knows the
                  action happened. */}
              <p className="admin-drawer__said" role="status">
                {said}
              </p>
            </section>
          </>
        )}
      </aside>
    </div>
  );
}
