import { useState } from "react";
import { adminBulk } from "../../api.js";
import { useT } from "../../i18n/I18nProvider.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

/**
 * The strip above a list when something is ticked: how many, and what can be
 * done to them.
 *
 * DESTRUCTIVE ONES ASK FOR THE COUNT TO BE TYPED. Not a yes/no, and not the
 * name of one row: "DELETE 12 POSTS", so the number somebody types is the
 * number that will go. A bulk control is the one place where the gap between
 * what you meant to select and what you actually selected can be large and
 * invisible, and typing the count is the only confirmation that makes you
 * look at it.
 *
 * PER-ITEM RESULTS ARE REPORTED, not swallowed. The server does what it can
 * and says what it could not; twelve selected where one is staff should
 * remove eleven and say why the twelfth stayed.
 */

/** What each action is called, and whether it needs the count typed. */
const ACTIONS = {
  feedback_handled: { label: "admin.bulk.markHandled", destructive: false },
  reports_resolve: { label: "admin.bulk.resolve", destructive: false },
  reports_dismiss: { label: "admin.bulk.dismiss", destructive: false },
  posts_delete: { label: "admin.bulk.deletePosts", destructive: true, noun: "admin.bulk.posts" },
  people_remove: { label: "admin.bulk.removePeople", destructive: true, noun: "admin.bulk.people" },
};

export default function BulkBar({ actions, selection, onDone }) {
  const t = useT();
  const [asking, setAsking] = useState(null); // the action key being confirmed
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState(null); // { done, failed, reasons }

  // Nothing ticked and nothing to report: the bar is not there at all. It
  // stays while there IS something to report, because clearing the selection
  // is the last thing an action does, and a result message that vanishes with
  // the bar that produced it is a result nobody ever reads.
  if (selection.count === 0 && !outcome) return null;

  async function run(action) {
    setBusy(true);
    setOutcome(null);
    try {
      const result = await adminBulk(action, selection.selected);
      // Group the refusals, so the message says "2 were staff accounts"
      // rather than listing twelve ids nobody can do anything with.
      const reasons = {};
      for (const row of result.results) {
        if (!row.ok) reasons[row.reason] = (reasons[row.reason] ?? 0) + 1;
      }
      setOutcome({ done: result.done, failed: result.failed, reasons });
      selection.clear();
      onDone?.();
    } catch {
      setOutcome({ done: 0, failed: selection.count, reasons: { failed: selection.count } });
    } finally {
      setBusy(false);
      setAsking(null);
    }
  }

  const confirming = asking ? ACTIONS[asking] : null;
  // "DELETE 12 POSTS". Built from the same count the bar is showing, so the
  // words and the number cannot disagree.
  const confirmText = confirming
    ? t("admin.bulk.confirmText", {
        count: selection.count,
        noun: t(confirming.noun, { count: selection.count }).toUpperCase(),
      })
    : "";

  return (
    <div className="admin-bulk" role="group" aria-label={t("admin.bulk.title")}>
      {selection.count > 0 && (
        <p className="admin-bulk__count">
          {t("admin.bulk.chosen", { count: selection.count })}
        </p>
      )}

      {selection.count > 0 &&
        actions.map((action) => (
        <button
          key={action}
          type="button"
          className={`button ${ACTIONS[action].destructive ? "button--danger" : ""}`}
          disabled={busy}
          onClick={() => (ACTIONS[action].destructive ? setAsking(action) : run(action))}
        >
          {t(ACTIONS[action].label)}
          </button>
        ))}

      <button
        type="button"
        className="button"
        disabled={busy}
        onClick={() => {
          selection.clear();
          setOutcome(null);
        }}
      >
        {t("admin.bulk.clear")}
      </button>

      {outcome && (
        <p className="admin-bulk__outcome" role="status">
          {t("admin.bulk.done", { count: outcome.done })}
          {outcome.failed > 0 &&
            ` ${Object.entries(outcome.reasons)
              .map(([reason, count]) => t(`admin.bulk.reasons.${reason}`, { count }))
              .join(" ")}`}
        </p>
      )}

      {confirming && (
        <ConfirmDialog
          title={t(confirming.label)}
          body={t("admin.bulk.confirmBody", { count: selection.count })}
          confirmLabel={t(confirming.label)}
          confirmText={confirmText}
          busy={busy}
          onConfirm={() => run(asking)}
          onCancel={() => setAsking(null)}
        />
      )}
    </div>
  );
}
