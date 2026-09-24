import { useId, useState } from "react";
import { markHelpful, reportPost } from "../api.js";
import { AlertIcon, FlagIcon, ThumbUpIcon } from "../components/Icons.jsx";
import { useI18n, useT } from "../i18n/I18nProvider.jsx";
import "./community.css";

// Small pieces shared by the three Community pages.

export const TOPICS = ["tlevels", "placements", "amazon", "choosing", "study", "other"];
export const REPORT_REASONS = ["personal", "unkind", "unsafe", "wrong", "spam", "other"];
const GUIDELINE_COUNT = 5;

/** A date in the reader's own language, e.g. "24 Sept 2026" or "24 wrz 2026". */
export function useFormatDate() {
  const { meta } = useI18n();
  return (value) =>
    new Intl.DateTimeFormat(meta.htmlLang, { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(value),
    );
}

/**
 * Who wrote something: their username and a role badge. Amazon staff and the
 * T-SMILE team stand out, so answers from them are easy to spot.
 */
export function Author({ author }) {
  const t = useT();
  const official = author.role === "amazon_staff" || author.role === "team";
  return (
    <span className="community-author">
      <span className="community-author__name">{author.username}</span>
      <span className={`community-badge${official ? " community-badge--official" : ""}`}>
        {t(`community.roles.${author.role}`)}
      </span>
    </span>
  );
}

/**
 * "Helpful": a toggle button, so it says whether you have pressed it
 * (aria-pressed). Signed-out visitors just see the count.
 */
export function HelpfulButton({ kind, post, signedIn, onChange }) {
  const t = useT();
  const [busy, setBusy] = useState(false);

  if (!signedIn || post.is_mine) {
    return post.helpful_count > 0 ? (
      <span className="community-meta">{t("community.helpfulCount", { count: post.helpful_count })}</span>
    ) : null;
  }

  async function toggle() {
    setBusy(true);
    try {
      const result = await markHelpful(kind, post.id);
      onChange({ found_helpful: result.found_helpful, helpful_count: result.helpful_count });
    } catch {
      // Nothing to undo: the button simply stays as it was.
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="community-action"
      aria-pressed={post.found_helpful}
      disabled={busy}
      onClick={toggle}
    >
      <ThumbUpIcon />
      {t("community.helpful")}
      {/* The space keeps the name "Helpful 2" for screen readers, not "Helpful2". */}
      {post.helpful_count > 0 && (
        <>
          {" "}
          <span className="community-action__count">{post.helpful_count}</span>
        </>
      )}
    </button>
  );
}

/**
 * "Report": opens a short set of reasons in place, rather than a pop-up, so
 * nothing jumps and the keyboard stays where it was.
 */
export function ReportControl({ kind, postId }) {
  const t = useT();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | sent | error

  async function send(event) {
    event.preventDefault();
    if (!reason) return;
    setState("sending");
    try {
      await reportPost(kind, postId, reason, note);
      setState("sent");
      setOpen(false);
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="community-meta" role="status">
        {t("community.reportThanks")}
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className="community-action" aria-expanded="false" onClick={() => setOpen(true)}>
        <FlagIcon />
        {t("community.report")}
      </button>
    );
  }

  return (
    <form className="community-report" onSubmit={send}>
      <fieldset>
        <legend>{t("community.reportTitle")}</legend>
        {REPORT_REASONS.map((value) => (
          <div className="community-report__option" key={value}>
            <input
              type="radio"
              id={`${id}-${value}`}
              name={`${id}-reason`}
              value={value}
              checked={reason === value}
              onChange={() => setReason(value)}
            />
            <label htmlFor={`${id}-${value}`}>{t(`community.reasons.${value}`)}</label>
          </div>
        ))}
      </fieldset>
      <label className="label" htmlFor={`${id}-note`}>
        {t("community.reportNote")}
      </label>
      <input id={`${id}-note`} value={note} maxLength={300} onChange={(event) => setNote(event.target.value)} />
      {state === "error" && (
        <p className="field__error" role="alert">
          <AlertIcon />
          {t("community.somethingWrong")}
        </p>
      )}
      <div className="community-report__actions">
        <button type="submit" className="button button--primary" disabled={!reason || state === "sending"}>
          {t("community.reportSend")}
        </button>
        <button type="button" className="button" onClick={() => setOpen(false)}>
          {t("community.reportCancel")}
        </button>
      </div>
    </form>
  );
}

/** The house rules, shown beside the question form. */
export function Guidelines() {
  const t = useT();
  return (
    <aside className="community-guidelines" aria-labelledby="community-guidelines-title">
      <h2 id="community-guidelines-title">{t("community.guidelinesTitle")}</h2>
      <ul>
        {Array.from({ length: GUIDELINE_COUNT }, (_, index) => (
          <li key={index}>{t(`community.guidelines.${index}`)}</li>
        ))}
      </ul>
    </aside>
  );
}

/**
 * Why a post was not published, from the server's moderation code, in the
 * poster's own language. Returns null when the error was something else.
 */
export function moderationMessage(t, error) {
  const reason = error?.body?.moderation?.[0];
  return reason ? t(`community.blocked.${reason}`) : null;
}

export function Notice({ children, tone = "info" }) {
  return (
    <div className={`notice${tone === "success" ? " notice--success" : ""}`} role={tone === "error" ? "alert" : "status"}>
      <AlertIcon />
      <div>{children}</div>
    </div>
  );
}
