import { useEffect, useRef } from "react";
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
 */
export default function ConfirmDialog({ title, body, confirmLabel, busy, onConfirm, onCancel }) {
  const t = useT();
  const confirmRef = useRef(null);

  // Land on the dialog rather than leaving focus behind on the row, and let
  // Escape out of it like any other dialog.
  useEffect(() => {
    confirmRef.current?.focus();
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
        <div className="account-card__actions">
          <button
            type="button"
            className="button button--danger"
            ref={confirmRef}
            disabled={busy}
            onClick={onConfirm}
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
