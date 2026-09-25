import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getInterestSubmissions } from "../api.js";
import { useAuth } from "../auth.jsx";
import { FormError } from "../components/FormFields.jsx";
import { formatDate, formatNumber } from "../formats.js";
import { useT } from "../i18n/I18nProvider.jsx";

// How much of a message shows before it is folded away. Long ones open in
// place rather than truncating with no way to read the rest.
const MESSAGE_PREVIEW = 90;

// Interest submissions, for Amazon staff. The redirect is just for convenience,
// the API is what actually blocks non-staff.
export default function StaffDashboard() {
  const t = useT();
  const { user, checked } = useAuth();
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const isStaff = user?.user_type === "amazon_staff";

  useEffect(() => {
    if (!isStaff) return undefined;

    let cancelled = false;
    setStatus("loading");

    getInterestSubmissions({ page })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [isStaff, page]);

  // Nothing until the first session check, so a staff member is never
  // bounced in the moment before we know who they are.
  if (!checked) return null;
  if (!isStaff) return <Navigate to="/" replace />;

  const results = data?.results ?? [];

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("account.roles.amazon_staff")}</p>
        <h1 id="page-title">{t("staff.title")}</h1>
        <p className="lead">{t("staff.lead")}</p>
      </section>

      {status === "error" && (
        <FormError message={t("staff.loadError")} />
      )}

      {status === "loading" && <p className="results-status">{t("staff.loading")}</p>}

      {status === "ready" && results.length === 0 && (
        <p className="results-status">{t("staff.empty")}</p>
      )}

      {status === "ready" && results.length > 0 && (
        <>
          <p className="results-status" role="status">
            {t(data.count === 1 ? "staff.countOne" : "staff.count", {
              count: formatNumber(data.count),
              shown: results.length,
            })}
          </p>

          {/* A scrollable region needs to be reachable by keyboard, so it
              takes tabIndex 0, and anything focusable needs a name. */}
          <div className="staff-table__scroll" tabIndex={0} role="region" aria-label={t("account.submissions")}>
            <table className="staff-table">
              <caption className="sr-only">{t("staff.caption")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("staff.columns.name")}</th>
                  <th scope="col">{t("staff.columns.email")}</th>
                  <th scope="col">{t("staff.columns.type")}</th>
                  <th scope="col">{t("staff.columns.pathway")}</th>
                  <th scope="col">{t("staff.columns.message")}</th>
                  <th scope="col">{t("staff.columns.submitted")}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.id}>
                    <td>{row.full_name}</td>
                    <td>
                      <a href={`mailto:${row.email}`}>{row.email}</a>
                    </td>
                    <td>{known(t, `account.roles.${row.user_type}`, row.user_type)}</td>
                    <td>{row.pathway}</td>
                    <td>
                      <SubmissionMessage message={row.message} />
                    </td>
                    <td>{formatDate(row.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="staff-pager" aria-label={t("staff.pages")}>
            <button
              type="button"
              className="button"
              disabled={!data.previous}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              {t("staff.previous")}
            </button>
            <p className="label">{t("staff.page", { page })}</p>
            <button
              type="button"
              className="button"
              disabled={!data.next}
              onClick={() => setPage((current) => current + 1)}
            >
              {t("staff.next")}
            </button>
          </nav>
        </>
      )}
    </>
  );
}

// A translation when there is one, otherwise the value the API sent.
function known(t, key, fallback) {
  const words = t(key);
  return words === key ? fallback : words;
}

/** A long message folds away rather than being cut off with no way to read it. */
function SubmissionMessage({ message }) {
  const t = useT();
  if (!message) return <span className="staff-table__empty">{t("staff.none")}</span>;
  if (message.length <= MESSAGE_PREVIEW) return <>{message}</>;

  return (
    <details>
      <summary>{`${message.slice(0, MESSAGE_PREVIEW).trimEnd()}...`}</summary>
      <p>{message}</p>
    </details>
  );
}
