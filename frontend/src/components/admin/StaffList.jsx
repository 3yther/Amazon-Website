import { useCallback, useEffect, useState } from "react";
import { FormError } from "../FormFields.jsx";
import { formatNumber } from "../../formats.js";
import { useT } from "../../i18n/I18nProvider.jsx";

/**
 * The bits every Admin Portal table shares: fetch a page, say what is
 * happening, and page through it.
 *
 * Four tabs do exactly this (Interest, Reported posts, Feedback, People), and
 * writing it four times is how they drift apart.
 */

/** Loads one page. `filters` must be a stable object, so build it with useMemo. */
export function useStaffList(fetcher, filters = {}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [attempt, setAttempt] = useState(0);

  const key = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetcher({ ...JSON.parse(key), page })
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
  }, [fetcher, key, page, attempt]);

  // Back to the first page whenever a filter changes, or page 3 of the old
  // filter shows as empty.
  useEffect(() => {
    setPage(1);
  }, [key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { data, status, page, setPage, reload };
}

/** An empty cell, in words rather than a blank that reads as a loading bug. */
export function Nothing() {
  const t = useT();
  return <span className="staff-table__empty">{t("staff.none")}</span>;
}

/** A translation when there is one, otherwise the value the API sent. */
export function known(t, key, fallback) {
  const words = t(key);
  return words === key ? fallback : words;
}

/** Long text folds away rather than being cut off with no way to read it. */
export function Folded({ text, at = 90 }) {
  if (!text) return <Nothing />;
  if (text.length <= at) return <>{text}</>;

  return (
    <details>
      <summary>{`${text.slice(0, at).trimEnd()}...`}</summary>
      <p>{text}</p>
    </details>
  );
}

/**
 * The shell around one table: the count, the error, the empty state and the
 * pager. `children` is the table itself, only rendered when there is one.
 */
export function StaffList({ label, caption, data, status, page, setPage, empty, children }) {
  const t = useT();
  const results = data?.results ?? [];

  if (status === "error") return <FormError message={t("staff.loadError")} />;
  if (status === "loading" && !data) return <p className="results-status">{t("staff.loading")}</p>;
  if (results.length === 0) return <p className="results-status">{empty ?? t("staff.empty")}</p>;

  return (
    <>
      <p className="results-status" role="status">
        {t(data.count === 1 ? "staff.countOne" : "staff.count", {
          count: formatNumber(data.count),
          shown: results.length,
        })}
      </p>

      {/* A scrollable region needs to be reachable by keyboard, so it takes
          tabIndex 0, and anything focusable needs a name. */}
      <div className="staff-table__scroll" tabIndex={0} role="region" aria-label={label}>
        <table className="staff-table">
          <caption className="sr-only">{caption}</caption>
          {children}
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
  );
}
