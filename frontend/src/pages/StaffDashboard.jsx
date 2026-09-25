import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getInterestSubmissions } from "../api.js";
import { useAuth } from "../auth.jsx";
import { FormError } from "../components/FormFields.jsx";
import { formatDate, formatNumber } from "../formats.js";
import { USER_TYPES } from "../labels.js";

// How much of a message shows before it is folded away. Long ones open in
// place rather than truncating with no way to read the rest.
const MESSAGE_PREVIEW = 90;

/**
 * Expression of Interest submissions, for Amazon staff.
 *
 * The redirect below is for a sensible experience, not for security: the
 * real gate is the server's IsAmazonStaff permission on
 * /api/interest/submissions/, which is what actually decides whether these
 * personal details are ever sent. Someone typing the URL in without a staff
 * account gets bounced here and would get a 403 from the API anyway.
 */
export default function StaffDashboard() {
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
        <p className="label">Amazon staff</p>
        <h1 id="page-title">Expression of Interest submissions</h1>
        <p className="lead">
          Everyone who has registered their interest, newest first. These are real people&rsquo;s
          contact details, so treat them accordingly.
        </p>
      </section>

      {status === "error" && (
        <FormError message="Could not load submissions. Refresh to try again." />
      )}

      {status === "loading" && <p className="results-status">Loading submissions.</p>}

      {status === "ready" && results.length === 0 && (
        <p className="results-status">No submissions yet.</p>
      )}

      {status === "ready" && results.length > 0 && (
        <>
          <p className="results-status" role="status">
            {formatNumber(data.count)} submission
            {data.count === 1 ? "" : "s"}, showing {results.length} on this page.
          </p>

          {/* A scrollable region needs to be reachable by keyboard, so it
              takes tabIndex 0, and anything focusable needs a name. */}
          <div className="staff-table__scroll" tabIndex={0} role="region" aria-label="Submissions">
            <table className="staff-table">
              <caption className="sr-only">
                Expression of Interest submissions, newest first
              </caption>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Type</th>
                  <th scope="col">Pathway</th>
                  <th scope="col">Message</th>
                  <th scope="col">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.id}>
                    <td>{row.full_name}</td>
                    <td>
                      <a href={`mailto:${row.email}`}>{row.email}</a>
                    </td>
                    <td>{USER_TYPES[row.user_type] ?? row.user_type}</td>
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

          <nav className="staff-pager" aria-label="Submission pages">
            <button
              type="button"
              className="button"
              disabled={!data.previous}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <p className="label">Page {page}</p>
            <button
              type="button"
              className="button"
              disabled={!data.next}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </>
  );
}

/** A long message folds away rather than being cut off with no way to read it. */
function SubmissionMessage({ message }) {
  if (!message) return <span className="staff-table__empty">None</span>;
  if (message.length <= MESSAGE_PREVIEW) return <>{message}</>;

  return (
    <details>
      <summary>{`${message.slice(0, MESSAGE_PREVIEW).trimEnd()}...`}</summary>
      <p>{message}</p>
    </details>
  );
}
