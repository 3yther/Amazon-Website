import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminDeactivate,
  adminFeedback,
  adminOverview,
  adminPeople,
  adminReportAction,
  adminReports,
  getInterestSubmissions,
} from "../../api.js";
import { useAuth } from "../../auth.jsx";
import { FormError } from "../FormFields.jsx";
import { formatDate, formatNumber } from "../../formats.js";
import { useT } from "../../i18n/I18nProvider.jsx";
import { Donut, GroupedBars } from "./Charts.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { Folded, Nothing, StaffList, known, useStaffList } from "./StaffList.jsx";

// The Admin Portal's five tabs. Everything they call needs Amazon staff and
// the PIN; the server checks both, and the page only ever gets here once the
// PIN is in (see AdminPortal.jsx).

/* ---------- Overview ---------- */

const USER_TYPES = ["student", "parent", "teacher"];

export function OverviewTab() {
  const t = useT();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    adminOverview()
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
  }, []);

  if (status === "error") return <FormError message={t("staff.loadError")} />;
  if (!data) return <p className="results-status">{t("staff.loading")}</p>;

  const { totals } = data;

  return (
    <div className="admin-overview">
      <ul className="admin-totals">
        {[
          ["people", totals.people],
          ["interest", totals.interest],
          ["questions", totals.questions],
          ["answers", totals.answers],
          ["feedback", totals.feedback],
          ["openReports", totals.open_reports],
        ].map(([key, value]) => (
          <li key={key} className="admin-total">
            <span className="admin-total__value">{formatNumber(value)}</span>
            <span className="label">{t(`admin.totals.${key}`)}</span>
          </li>
        ))}
      </ul>

      <div className="admin-charts">
        <GroupedBars
          title={t("admin.charts.signups")}
          caption={t("admin.charts.signupsCaption")}
          rows={data.signups}
          series={USER_TYPES.map((type) => ({ key: type, label: t(`account.roles.${type}`) }))}
        />

        <Donut
          title={t("admin.charts.interest")}
          caption={t("admin.charts.interestCaption")}
          segments={data.interest_by_pathway}
        />

        <GroupedBars
          title={t("admin.charts.community")}
          caption={t("admin.charts.communityCaption")}
          rows={data.community_activity}
          series={[
            { key: "questions", label: t("admin.totals.questions") },
            { key: "answers", label: t("admin.totals.answers") },
          ]}
        />

        <Donut
          title={t("admin.charts.feedback")}
          caption={t("admin.charts.feedbackCaption")}
          segments={data.feedback_by_category.map((row) => ({
            ...row,
            label: known(t, `feedbackPage.categories.${row.label}`, row.label),
          }))}
        />
      </div>
    </div>
  );
}

/* ---------- Interest ---------- */

// Moved from the old /staff page unchanged: same columns, same behaviour.
export function InterestTab() {
  const t = useT();
  const filters = useMemo(() => ({}), []);
  const list = useStaffList(getInterestSubmissions, filters);

  return (
    <StaffList
      label={t("account.submissions")}
      caption={t("staff.caption")}
      empty={t("staff.empty")}
      {...list}
    >
      <thead>
        <tr>
          {["name", "email", "type", "pathway", "message", "submitted"].map((column) => (
            <th key={column} scope="col">
              {t(`staff.columns.${column}`)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(list.data?.results ?? []).map((row) => (
          <tr key={row.id}>
            <td>{row.full_name || row.username || <Nothing />}</td>
            <td>{row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : <Nothing />}</td>
            <td>
              {row.user_type ? known(t, `account.roles.${row.user_type}`, row.user_type) : <Nothing />}
            </td>
            <td>{row.pathway ?? <Nothing />}</td>
            <td>
              <Folded text={row.message} />
            </td>
            <td>{formatDate(row.submitted_at)}</td>
          </tr>
        ))}
      </tbody>
    </StaffList>
  );
}

/* ---------- Reported posts ---------- */

export function ReportsTab() {
  const t = useT();
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [confirming, setConfirming] = useState(null); // the report about to be deleted
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  const filters = useMemo(() => ({ resolved: onlyOpen ? "false" : "" }), [onlyOpen]);
  const list = useStaffList(adminReports, filters);

  async function act(report, action) {
    setProblem("");
    setBusy(true);
    try {
      await adminReportAction(report.id, action);
      list.reload();
    } catch {
      setProblem(t("admin.actionFailed"));
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  return (
    <>
      {problem && <FormError message={problem} />}

      <div className="admin-filters">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(event) => setOnlyOpen(event.target.checked)}
          />
          {t("admin.reports.onlyOpen")}
        </label>
      </div>

      <StaffList
        label={t("admin.tabs.reports")}
        caption={t("admin.reports.caption")}
        empty={t("admin.reports.empty")}
        {...list}
      >
        <thead>
          <tr>
            {["post", "author", "reason", "reportedBy", "state", "actions"].map((column) => (
              <th key={column} scope="col">
                {t(`admin.reports.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(list.data?.results ?? []).map((row) => (
            <tr key={row.id}>
              <td>
                <span className="label">{t(`admin.reports.kind.${row.kind}`)}</span>
                <Folded text={row.title || row.body} />
              </td>
              <td>{row.author || <Nothing />}</td>
              <td>
                {known(t, `community.reasons.${row.reason}`, row.reason)}
                {row.note ? <Folded text={row.note} at={40} /> : null}
              </td>
              <td>{row.reporter || <Nothing />}</td>
              <td>
                {row.hidden ? t("admin.reports.hidden") : t("admin.reports.live")}
                {row.resolved ? ` · ${t("admin.reports.resolved")}` : ""}
              </td>
              <td>
                <div className="admin-row-actions">
                  {row.hidden ? (
                    <button
                      type="button"
                      className="button"
                      disabled={busy}
                      onClick={() => act(row, "restore")}
                    >
                      {t("admin.reports.restore")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="button"
                      disabled={busy}
                      onClick={() => act(row, "hide")}
                    >
                      {t("admin.reports.hide")}
                    </button>
                  )}
                  {/* Delete asks first. Hide does not, because hide can be
                      undone by the button next to it and this cannot. */}
                  <button
                    type="button"
                    className="button button--danger"
                    disabled={busy}
                    onClick={() => setConfirming(row)}
                  >
                    {t("admin.reports.delete")}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </StaffList>

      {confirming && (
        <ConfirmDialog
          title={t("admin.reports.deleteTitle")}
          body={
            confirming.kind === "question"
              ? t("admin.reports.deleteQuestionBody")
              : t("admin.reports.deleteAnswerBody")
          }
          confirmLabel={t("admin.reports.delete")}
          busy={busy}
          onConfirm={() => act(confirming, "delete")}
          onCancel={() => setConfirming(null)}
        />
      )}
    </>
  );
}

/* ---------- Feedback ---------- */

const FEEDBACK_CATEGORIES = ["bug", "feature", "general", "accessibility"];

export function FeedbackTab() {
  const t = useT();
  const [category, setCategory] = useState("");
  const filters = useMemo(() => ({ category }), [category]);
  const list = useStaffList(adminFeedback, filters);

  return (
    <>
      <div className="admin-filters">
        <label className="label" htmlFor="admin-feedback-category">
          {t("admin.feedback.filter")}
        </label>
        <select
          id="admin-feedback-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">{t("admin.allOf")}</option>
          {FEEDBACK_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {known(t, `feedbackPage.categories.${value}`, value)}
            </option>
          ))}
        </select>
      </div>

      <StaffList
        label={t("admin.tabs.feedback")}
        caption={t("admin.feedback.caption")}
        empty={t("admin.feedback.empty")}
        {...list}
      >
        <thead>
          <tr>
            {["category", "message", "from", "submitted"].map((column) => (
              <th key={column} scope="col">
                {t(`admin.feedback.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(list.data?.results ?? []).map((row) => (
            <tr key={row.id}>
              <td>{known(t, `feedbackPage.categories.${row.category}`, row.category)}</td>
              <td>
                <Folded text={row.message} />
              </td>
              <td>
                {row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : row.username || <Nothing />}
              </td>
              <td>{formatDate(row.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </StaffList>
    </>
  );
}

/* ---------- People ---------- */

export function PeopleTab() {
  const t = useT();
  const { user } = useAuth();
  const [userType, setUserType] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  const filters = useMemo(() => ({ user_type: userType, q: query }), [userType, query]);
  const list = useStaffList(adminPeople, filters);

  const runSearch = useCallback(
    (event) => {
      event.preventDefault();
      setQuery(search.trim());
    },
    [search],
  );

  async function deactivate(person) {
    setProblem("");
    setBusy(true);
    try {
      await adminDeactivate(person.id);
      list.reload();
    } catch {
      setProblem(t("admin.actionFailed"));
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  return (
    <>
      {problem && <FormError message={problem} />}

      <form className="admin-filters" onSubmit={runSearch} role="search">
        <label className="label" htmlFor="admin-people-search">
          {t("admin.people.search")}
        </label>
        <input
          id="admin-people-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <label className="label" htmlFor="admin-people-type">
          {t("admin.people.filter")}
        </label>
        <select
          id="admin-people-type"
          value={userType}
          onChange={(event) => setUserType(event.target.value)}
        >
          <option value="">{t("admin.allOf")}</option>
          {[...USER_TYPES, "amazon_staff"].map((value) => (
            <option key={value} value={value}>
              {known(t, `account.roles.${value}`, value)}
            </option>
          ))}
        </select>
        <button type="submit" className="button">
          {t("community.searchButton")}
        </button>
      </form>

      <StaffList
        label={t("admin.tabs.people")}
        caption={t("admin.people.caption")}
        empty={t("admin.people.empty")}
        {...list}
      >
        <thead>
          <tr>
            {["username", "type", "joined", "posts", "state", "actions"].map((column) => (
              <th key={column} scope="col">
                {t(`admin.people.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(list.data?.results ?? []).map((row) => (
            <tr key={row.id}>
              <td>{row.username}</td>
              <td>{row.user_type ? known(t, `account.roles.${row.user_type}`, row.user_type) : <Nothing />}</td>
              <td>{formatDate(row.date_joined)}</td>
              <td>{formatNumber(row.questions + row.answers)}</td>
              <td>{row.is_active ? t("admin.people.active") : t("admin.people.deactivated")}</td>
              <td>
                {row.is_active && row.username !== user?.username ? (
                  <button
                    type="button"
                    className="button button--danger"
                    disabled={busy}
                    onClick={() => setConfirming(row)}
                  >
                    {t("admin.people.deactivate")}
                  </button>
                ) : (
                  <Nothing />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </StaffList>

      {confirming && (
        <ConfirmDialog
          title={t("admin.people.deactivateTitle")}
          body={t("admin.people.deactivateBody", { username: confirming.username })}
          confirmLabel={t("admin.people.deactivate")}
          busy={busy}
          onConfirm={() => deactivate(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}
    </>
  );
}
