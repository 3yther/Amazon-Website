import { useT } from "../../i18n/I18nProvider.jsx";

/**
 * What a card or a chart shows when it has no numbers yet, none at all, or
 * could not get them.
 *
 * Three different things that all look like "nothing here" if you are careless
 * about it, and telling them apart is most of whether a dashboard is usable:
 * a chart still loading, a chart with genuinely no data, and a chart whose
 * request failed are three different problems, and only one of them is worth
 * the staff member's attention.
 *
 * The skeleton does not pulse. Every animation on this site has to stop under
 * reduced motion, and a skeleton that needs a media query to be safe is more
 * trouble than a plain block that never moves.
 */

export function Skeleton({ lines = 3, label }) {
  const t = useT();
  return (
    <div className="admin-skeleton" role="status" aria-live="polite">
      <span className="sr-only">{label ?? t("admin.states.loading")}</span>
      {Array.from({ length: lines }, (_, index) => (
        <span className="admin-skeleton__bar" key={index} aria-hidden="true" />
      ))}
    </div>
  );
}

export function ErrorState({ onRetry, message }) {
  const t = useT();
  return (
    <div className="admin-error" role="alert">
      <p>{message ?? t("admin.states.failed")}</p>
      {onRetry && (
        <button type="button" className="button" onClick={onRetry}>
          {t("admin.states.retry")}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }) {
  const t = useT();
  return <p className="admin-chart__empty">{message ?? t("admin.noData")}</p>;
}
