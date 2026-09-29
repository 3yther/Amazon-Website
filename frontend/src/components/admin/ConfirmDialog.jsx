import { useEffect, useRef, useState } from "react";
import { useT } from "../../i18n/I18nProvider.jsx";

/**
 * "Are you sure?" for the two things in the portal that cannot be undone:
 * deleting a post and deactivating an account.
 *
 * Same markup as the deactivate-my-account dialog in AccountSettings.jsx, so
 * a destructive action looks the same wherever it is on this site.
 *
 * Neither of these fires on one click, on purpose. Hide is one click because
 * it is reversible; these are not.
 *
 * `confirmText` makes it harder still: the button stays off until that exact
 * text has been typed, the way GitHub asks for a repository's name. Used
 * where a slip of the mouse would delete a person.
 */
export default function ConfirmDialog({
  title,
  body,
  confirmLabel,
  confirmText,
  busy,
  onConfirm,
  onCancel,
}) {
  const t = useT();
  const confirmRef = useRef(null);
  const typedRef = useRef(null);
  const [typed, setTyped] = useState("");
  const armed = !confirmText || typed === confirmText;

  // Land on the dialog rather than leaving focus behind on the row, and let
  // Escape out of it like any other dialog. With something to type, focus goes
  // to the field, because that is the next thing anybody has to do.
  useEffect(() => {
    (typedRef.current ?? confirmRef.current)?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        <p>{body}</p>
        {confirmText && (
          <div className="field">
            <label className="label" htmlFor="confirm-typed">
              {t("admin.typeToConfirm", { text: confirmText })}
            </label>
            <input
              id="confirm-typed"
              ref={typedRef}
              type="text"
              value={typed}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && armed && !busy) onConfirm(typed);
              }}
            />
          </div>
        )}
        <div className="account-card__actions">
          <button
            type="button"
            className="button button--danger"
            ref={confirmRef}
            disabled={busy || !armed}
            onClick={() => onConfirm(typed)}
          >
            {busy ? t("admin.working") : confirmLabel}
          </button>
          <button type="button" className="button" onClick={onCancel} disabled={busy}>
            {t("admin.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
