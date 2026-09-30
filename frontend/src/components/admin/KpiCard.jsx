import { useT } from "../../i18n/I18nProvider.jsx";

/**
 * One KPI: the number, how it moved against the period before, and a
 * sparkline.
 *
 * COLOUR IS NEVER THE ONLY SIGNAL. The change carries an arrow and a signed
 * number as well as a colour, so it reads the same in greyscale, through a
 * colour-vision filter, or to a screen reader. That is the rule the whole
 * admin palette is built on (see CONTEXT.md).
 *
 * UP IS NOT ALWAYS GOOD. Open reports rising is bad and time-to-first-answer
 * falling is good, so the card is told which direction is the good one rather
 * than assuming more is better. Without that, a dashboard cheerfully paints a
 * growing moderation queue green.
 *
 * NO PERCENTAGE OUT OF NOTHING. When the period before was empty the server
 * sends null, and the card says "new" rather than dividing by zero.
 */

/**
 * What each card is called. Six of these already had names on the old
 * Overview's totals, and reusing them keeps one wording for one number across
 * every language rather than translating "Accounts" twice and letting the two
 * drift apart.
 */
const KPI_LABELS = {
  accounts: "admin.totals.people",
  interest: "admin.totals.interest",
  questions: "admin.totals.questions",
  answers: "admin.totals.answers",
  feedback: "admin.totals.feedback",
  open_reports: "admin.totals.openReports",
};

/** A tiny line, drawn from the points as they come. Decorative. */
function Sparkline({ points }) {
  if (!points || points.length < 2) return null;

  const most = Math.max(...points);
  const least = Math.min(...points);
  const span = most - least || 1;
  const step = 100 / (points.length - 1);

  // 0 at the top in SVG, so the value is flipped to draw the right way up.
  const path = points
    .map((value, index) => `${index * step},${24 - ((value - least) / span) * 22}`)
    .join(" ");

  return (
    <svg
      className="admin-kpi__spark"
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points={path} />
    </svg>
  );
}

/** An arrow, so the direction survives without the colour. */
function DirectionIcon({ up }) {
  return (
    <svg
      className="admin-kpi__arrow"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
    >
      {up ? (
        <path d="M8 13V3M8 3 3.5 7.5M8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d="M8 3v10M8 13l-4.5-4.5M8 13l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  );
}

export default function KpiCard({ card }) {
  const t = useT();
  const { key, value, unit, change, percent, spark, lower_is_better: lowerIsBetter } = card;

  const label = t(KPI_LABELS[key] ?? `admin.kpis.${key}`);
  const shown = unit === "hours" ? t("admin.kpis.hoursValue", { hours: value }) : value;

  // No movement to show: either nothing to compare against, or it did not move.
  const moved = change !== null && change !== undefined && change !== 0;
  const up = moved && change > 0;
  const good = moved ? (lowerIsBetter ? !up : up) : null;

  return (
    <article className="admin-kpi">
      <p className="label admin-kpi__label">{label}</p>
      <p className="admin-kpi__value">{shown}</p>

      {moved ? (
        <p className={`admin-kpi__change admin-kpi__change--${good ? "good" : "bad"}`}>
          {/* One sentence for a screen reader rather than an arrow and two
              numbers read out separately, which is noise. It is real hidden
              text and not aria-label, because a <p> has no role to carry an
              aria-label and axe rightly refuses it. */}
          <span className="sr-only">
            {t(up ? "admin.kpis.upBy" : "admin.kpis.downBy", {
              label,
              change: Math.abs(change),
              percent: percent === null ? t("admin.kpis.noPercent") : `${Math.abs(percent)}%`,
            })}
          </span>
          <span className="admin-kpi__change-visual" aria-hidden="true">
            <DirectionIcon up={up} />
            {up ? "+" : "-"}
            {Math.abs(change)}
            {percent !== null && percent !== undefined && ` (${up ? "+" : "-"}${Math.abs(percent)}%)`}
          </span>
        </p>
      ) : (
        <p className="admin-kpi__change admin-kpi__change--flat">
          {change === null || change === undefined
            ? t("admin.kpis.noComparison")
            : t("admin.kpis.noChange")}
        </p>
      )}

      <Sparkline points={spark} />
    </article>
  );
}
