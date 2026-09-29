import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminDeletePost,
  adminAuditLog,
  adminFeedback,
  adminHandleFeedback,
  adminPeople,
  adminPosts,
  adminProviders,
  adminRemoveAccount,
  adminReportAction,
  adminReports,
  adminRevokeStaff,
  getInterestSubmissions,
} from "../../api.js";
import { useAuth } from "../../auth.jsx";
import { FormError } from "../FormFields.jsx";
import { formatDate, formatNumber } from "../../formats.js";
import { useT } from "../../i18n/I18nProvider.jsx";
import BulkBar from "./BulkBar.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import PersonDrawer from "./PersonDrawer.jsx";
import useSelection from "./useSelection.js";
import { Folded, Nothing, StaffList, known, useStaffList } from "./StaffList.jsx";

// The Admin Portal's data tabs. Everything they call needs Amazon staff and
// the PIN; the server checks both, and the page only ever gets here once the
// PIN is in (see AdminPortal.jsx). The Overview lives in Overview.jsx.

/** The three types somebody can sign themselves up as. Staff is not one. */
const USER_TYPES = ["student", "parent", "teacher"];

/**
 * The tick in a row, and the one in the header that takes the whole page.
 *
 * Each has a real label rather than a bare box: a column of unlabelled
 * checkboxes is unusable with a screen reader, because there is nothing to
 * say WHICH row each one belongs to.
 */
function SelectRow({ selection, id, label }) {
  const t = useT();
  return (
    <label className="admin-select">
      <input
        type="checkbox"
        checked={selection.has(id)}
        onChange={() => selection.toggle(id)}
      />
      <span className="sr-only">{t("admin.bulk.choose", { name: String(label).slice(0, 40) })}</span>
    </label>
  );
}

function SelectAll({ selection }) {
  const t = useT();
  return (
    <label className="admin-select">
      <input type="checkbox" checked={selection.allOnPage} onChange={selection.toggleAll} />
      <span className="sr-only">{t("admin.bulk.chooseAll")}</span>
    </label>
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

/**
 * One row's handled state, its note, and the two controls that change them.
 *
 * The note is a <details>, closed by default: most rows never get one, and a
 * textarea on every row would bury the messages the tab exists to show.
 */
function FeedbackRowActions({ row, onChanged }) {
  const t = useT();
  const [note, setNote] = useState(row.admin_note ?? "");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function save(handled, withNote = note) {
    setBusy(true);
    setFailed(false);
    try {
      const updated = await adminHandleFeedback(row.id, { handled, adminNote: withNote });
      onChanged(updated);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-feedback__actions">
      <button
        type="button"
        className="button"
        disabled={busy}
        onClick={() => save(!row.handled)}
      >
        {row.handled ? t("admin.feedback.markUnhandled") : t("admin.feedback.markHandled")}
      </button>

      <details className="admin-feedback__note">
        <summary>{t("admin.feedback.note")}</summary>
        <label className="sr-only" htmlFor={`note-${row.id}`}>
          {t("admin.feedback.note")}
        </label>
        <textarea
          id={`note-${row.id}`}
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <button type="button" className="button" disabled={busy} onClick={() => save(row.handled)}>
          {t("admin.feedback.saveNote")}
        </button>
      </details>

      {failed && (
        <p className="field__error" role="alert">
          {t("admin.actionFailed")}
        </p>
      )}
    </div>
  );
}

export function FeedbackTab({ onCountsChanged }) {
  const t = useT();
  const [category, setCategory] = useState("");
  const [handled, setHandled] = useState("");
  const filters = useMemo(() => ({ category, handled }), [category, handled]);
  const list = useStaffList(adminFeedback, filters);

  // The row is patched in place rather than the whole page being refetched:
  // marking six things handled should not reshuffle the list under the cursor
  // six times.
  const [changed, setChanged] = useState({});
  const rowsWithChanges = (list.data?.results ?? []).map((row) =>
    changed[row.id] ? { ...row, ...changed[row.id] } : row,
  );
  const selection = useSelection(rowsWithChanges);

  function applyChange(updated) {
    setChanged((current) => ({ ...current, [updated.id]: updated }));
    onCountsChanged?.();
  }

  return (
    <>
      <div className="admin-filters">
        <div className="admin-filters__field">
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

        <div className="admin-filters__field">
          <label className="label" htmlFor="admin-feedback-handled">
            {t("admin.feedback.status")}
          </label>
          <select
            id="admin-feedback-handled"
            value={handled}
            onChange={(event) => setHandled(event.target.value)}
          >
            <option value="">{t("admin.allOf")}</option>
            <option value="false">{t("admin.feedback.unhandled")}</option>
            <option value="true">{t("admin.feedback.handled")}</option>
          </select>
        </div>
      </div>

      <BulkBar
        actions={["feedback_handled"]}
        selection={selection}
        onDone={() => {
          list.reload();
          onCountsChanged?.();
        }}
      />

      <StaffList
        label={t("admin.tabs.feedback")}
        caption={t("admin.feedback.caption")}
        empty={t("admin.feedback.empty")}
        {...list}
      >
        <thead>
          <tr>
            <th scope="col" className="admin-select__cell">
              <SelectAll selection={selection} />
            </th>
            {["category", "message", "from", "submitted", "status", "actions"].map((column) => (
              <th key={column} scope="col">
                {t(`admin.feedback.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowsWithChanges.map((row) => (
            <tr key={row.id}>
              <td className="admin-select__cell">
                <SelectRow selection={selection} id={row.id} label={row.message} />
              </td>
              <td>{known(t, `feedbackPage.categories.${row.category}`, row.category)}</td>
              <td>
                <Folded text={row.message} />
                {row.admin_note && (
                  <p className="admin-feedback__saved-note">
                    <span className="label">{t("admin.feedback.note")}</span> {row.admin_note}
                  </p>
                )}
              </td>
              <td>
                {row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : row.username || <Nothing />}
              </td>
              <td>{formatDate(row.created_at)}</td>
              <td>
                {row.handled ? (
                  /* Who and when, not just a tick: "handled" with nobody's
                     name against it is the same as not knowing. */
                  <span className="admin-feedback__handled">
                    {t("admin.feedback.handledBy", {
                      name: row.handled_by || t("admin.feedback.someone"),
                      date: row.handled_at ? formatDate(row.handled_at) : "",
                    })}
                  </span>
                ) : (
                  <span className="admin-feedback__waiting">{t("admin.feedback.unhandled")}</span>
                )}
              </td>
              <td>
                <FeedbackRowActions row={row} onChanged={applyChange} />
              </td>
            </tr>
          ))}
        </tbody>
      </StaffList>

    </>
  );
}

/* ---------- Community ---------- */

/**
 * Every question and answer, so staff can take one down without waiting for a
 * report. Deleting asks first, and says what else goes with it.
 */
export function PostsTab() {
  const t = useT();
  const [kind, setKind] = useState("question");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  // Which account's drawer is open, by id.
  const [looking, setLooking] = useState(null);

  const filters = useMemo(() => ({ kind, q: query }), [kind, query]);
  const list = useStaffList(adminPosts, filters);

  const runSearch = useCallback(
    (event) => {
      event.preventDefault();
      setQuery(search.trim());
    },
    [search],
  );

  async function remove(post) {
    setProblem("");
    setBusy(true);
    try {
      await adminDeletePost(post.kind, post.id);
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
        <label className="label" htmlFor="admin-posts-search">
          {t("admin.posts.search")}
        </label>
        <input
          id="admin-posts-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <label className="label" htmlFor="admin-posts-kind">
          {t("admin.posts.show")}
        </label>
        <select id="admin-posts-kind" value={kind} onChange={(event) => setKind(event.target.value)}>
          <option value="question">{t("admin.posts.questions")}</option>
          <option value="answer">{t("admin.posts.answers")}</option>
        </select>
        <button type="submit" className="button">
          {t("community.searchButton")}
        </button>
      </form>

      <StaffList
        label={t("admin.tabs.posts")}
        caption={t("admin.posts.caption")}
        empty={t("admin.posts.empty")}
        {...list}
      >
        <thead>
          <tr>
            {["post", "author", "posted", "state", "actions"].map((column) => (
              <th key={column} scope="col">
                {t(`admin.posts.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(list.data?.results ?? []).map((row) => (
            <tr key={`${row.kind}-${row.id}`}>
              <td>
                {row.kind === "answer" ? (
                  <>
                    <span className="label">{t("admin.posts.replyTo", { title: row.title })}</span>
                    <Folded text={row.body} />
                  </>
                ) : (
                  <>
                    <strong>{row.title}</strong>
                    <Folded text={row.body} />
                    <span className="label">
                      {t(row.answers === 1 ? "admin.posts.answerCountOne" : "admin.posts.answerCount", {
                        count: row.answers,
                      })}
                    </span>
                  </>
                )}
              </td>
              <td>{row.author || <Nothing />}</td>
              <td>{formatDate(row.created_at)}</td>
              <td>{row.hidden ? t("admin.reports.hidden") : t("admin.reports.live")}</td>
              <td>
                <button
                  type="button"
                  className="button button--danger"
                  disabled={busy}
                  onClick={() => setConfirming(row)}
                >
                  {t("admin.reports.delete")}
                </button>
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
              ? t("admin.posts.deleteQuestionBody", { count: confirming.answers })
              : t("admin.reports.deleteAnswerBody")
          }
          confirmLabel={t("admin.reports.delete")}
          busy={busy}
          onConfirm={() => remove(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}
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
  // What is being confirmed: { kind: "remove" | "revoke", person }.
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  // Which account's drawer is open, by id.
  const [looking, setLooking] = useState(null);

  const filters = useMemo(() => ({ user_type: userType, q: query }), [userType, query]);
  const list = useStaffList(adminPeople, filters);

  const runSearch = useCallback(
    (event) => {
      event.preventDefault();
      setQuery(search.trim());
    },
    [search],
  );

  async function run(action) {
    setProblem("");
    setBusy(true);
    try {
      await action();
      list.reload();
    } catch {
      setProblem(t("admin.actionFailed"));
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  const remove = (person, typed) => run(() => adminRemoveAccount(person.id, typed));
  const revoke = (person) => run(() => adminRevokeStaff(person.id));

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
            {["username", "type", "joined", "posts", "actions"].map((column) => (
              <th key={column} scope="col">
                {t(`admin.people.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(list.data?.results ?? []).map((row) => {
            const isYou = row.username === user?.username;
            const isAdmin = row.user_type === "amazon_staff";
            return (
              <tr key={row.id}>
                <td>
                  <button
                    type="button"
                    className="admin-people__open"
                    onClick={() => setLooking(row.id)}
                  >
                    {row.username}
                  </button>
                </td>
                <td>{row.user_type ? known(t, `account.roles.${row.user_type}`, row.user_type) : <Nothing />}</td>
                <td>{formatDate(row.date_joined)}</td>
                <td>{formatNumber(row.questions + row.answers)}</td>
                <td>
                  {isYou ? (
                    <Nothing />
                  ) : isAdmin ? (
                    // An admin is not removed in one step: their access goes
                    // first, and only then can the account itself.
                    <button
                      type="button"
                      className="button"
                      disabled={busy}
                      onClick={() => setConfirming({ kind: "revoke", person: row })}
                    >
                      {t("admin.people.revoke")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="button button--danger"
                      disabled={busy}
                      onClick={() => setConfirming({ kind: "remove", person: row })}
                    >
                      {t("admin.people.remove")}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </StaffList>

      {confirming?.kind === "remove" && (
        <ConfirmDialog
          title={t("admin.people.removeTitle")}
          body={t("admin.people.removeBody", { username: confirming.person.username })}
          confirmLabel={t("admin.people.remove")}
          confirmText={confirming.person.username}
          busy={busy}
          onConfirm={(typed) => remove(confirming.person, typed)}
          onCancel={() => setConfirming(null)}
        />
      )}

      {confirming?.kind === "revoke" && (
        <ConfirmDialog
          title={t("admin.people.revokeTitle")}
          body={t("admin.people.revokeBody", { username: confirming.person.username })}
          confirmLabel={t("admin.people.revoke")}
          busy={busy}
          onConfirm={() => revoke(confirming.person)}
          onCancel={() => setConfirming(null)}
        />
      )}

      {looking !== null && (
        <PersonDrawer
          personId={looking}
          onClose={() => setLooking(null)}
          /* A role change reorders nothing, but the row's own type is now
             stale, so the list is asked again. */
          onChanged={list.reload}
        />
      )}
    </>
  );
}

/* ---------- Audit log ---------- */

/** The actions the filter offers, in the order they appear on the model. */
const AUDIT_ACTIONS = [
  "account_removed",
  "staff_revoked",
  "role_changed",
  "password_reset_sent",
  "post_deleted",
  "report_resolved",
  "report_dismissed",
  "feedback_handled",
  "csv_exported",
];

/**
 * Who did what, and when. Read-only, and deliberately so: an audit log with
 * an edit button on it is not an audit log.
 *
 * The staff member's name comes from the stored copy rather than the linked
 * account, so an entry still names whoever did it after their own account has
 * gone. That is most of the point of having it.
 */
export function AuditLogTab() {
  const t = useT();
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const filters = useMemo(() => ({ actor, action }), [actor, action]);
  const list = useStaffList(adminAuditLog, filters);

  return (
    <>
      <div className="admin-filters">
        <div className="admin-filters__field">
          <label className="label" htmlFor="audit-actor">
            {t("admin.audit.actor")}
          </label>
          <input
            id="audit-actor"
            type="search"
            value={actor}
            onChange={(event) => setActor(event.target.value)}
          />
        </div>

        <div className="admin-filters__field">
          <label className="label" htmlFor="audit-action">
            {t("admin.audit.action")}
          </label>
          <select
            id="audit-action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
          >
            <option value="">{t("admin.allOf")}</option>
            {AUDIT_ACTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`admin.audit.actions.${value}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <StaffList
        label={t("admin.tabs.audit")}
        caption={t("admin.audit.caption")}
        empty={t("admin.audit.empty")}
        {...list}
      >
        <thead>
          <tr>
            {["when", "who", "what", "target"].map((column) => (
              <th key={column} scope="col">
                {t(`admin.audit.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(list.data?.results ?? []).map((row) => (
            <tr key={row.id}>
              <td>{formatDate(row.created_at)}</td>
              <td>{row.actor || <Nothing />}</td>
              <td>{t(`admin.audit.actions.${row.action}`)}</td>
              <td>
                {/* Its own element, so the name of the thing acted on is
                    readable on its own rather than running into the detail
                    beside it. */}
                <span className="admin-audit__target">{row.target_label || <Nothing />}</span>
                {row.detail && Object.keys(row.detail).length > 0 && (
                  <Folded text={JSON.stringify(row.detail)} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </StaffList>
    </>
  );
}

/* ---------- Providers ---------- */

/**
 * The provider list, read-only. Editing stays in Django admin, which already
 * has the forms and the validation; this exists to find the ones whose
 * postcode needs fixing before they can go on the map.
 */
export function ProvidersTab() {
  const t = useT();
  const [placed, setPlaced] = useState("");
  const filters = useMemo(() => ({ placed }), [placed]);
  const list = useStaffList(adminProviders, filters);

  return (
    <>
      <div className="admin-filters">
        <div className="admin-filters__field">
          <label className="label" htmlFor="providers-placed">
            {t("admin.providers.filter")}
          </label>
          <select
            id="providers-placed"
            value={placed}
            onChange={(event) => setPlaced(event.target.value)}
          >
            <option value="">{t("admin.allOf")}</option>
            <option value="false">{t("admin.providers.unplacedOnly")}</option>
            <option value="true">{t("admin.providers.placedOnly")}</option>
          </select>
        </div>
      </div>

      <StaffList
        label={t("admin.tabs.providers")}
        caption={t("admin.providers.caption")}
        empty={t("admin.providers.empty")}
        {...list}
      >
        <thead>
          <tr>
            {["name", "postcode", "region", "type", "map"].map((column) => (
              <th key={column} scope="col">
                {t(`admin.providers.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(list.data?.results ?? []).map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.postcode}</td>
              <td>{row.region}</td>
              <td>{row.provider_type}</td>
              {/* Words, not a tick or a colour: this column is the reason the
                  tab exists, and it has to be readable to everybody. */}
              <td>{row.placed ? t("admin.providers.onMap") : t("admin.providers.needsPostcode")}</td>
            </tr>
          ))}
        </tbody>
      </StaffList>
    </>
  );
}
