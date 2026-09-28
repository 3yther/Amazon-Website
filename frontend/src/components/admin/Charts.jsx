import { useT } from "../../i18n/I18nProvider.jsx";

/**
 * The Overview tab's charts, hand-built.
 *
 * No charting library on purpose: the site already draws its bars with plain
 * CSS (see the GROWTH bars on TLevelsAtAmazon.jsx), and a dependency that
 * ships its own colours would fight CONTEXT.md's rule of orange and dark blue
 * only, no gradients.
 *
 * EVERY CHART HERE HAS A TEXT VERSION OF THE SAME NUMBERS, in a <table> that
 * screen readers read and everyone else can open. A picture of a ring is
 * nothing without it, and this project targets WCAG 2.2 AA. The numbers come
 * from the same array the chart is drawn from, so the two cannot drift.
 *
 * Nothing here animates. The bars are sized by inline width/height and the
 * ring by stroke-dasharray, both set once at render, so there is no motion to
 * reduce and nothing for prefers-reduced-motion to turn off.
 */

/** A data table saying exactly what the chart says, for screen readers. */
function ChartTable({ caption, rows, columns }) {
  const t = useT();
  return (
    <details className="admin-chart__data">
      <summary>{t("admin.showNumbers")}</summary>
      <table className="staff-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={index}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

function EmptyChart() {
  const t = useT();
  return <p className="admin-chart__empty">{t("admin.noData")}</p>;
}

/**
 * Bars in groups, e.g. sign-ups per week split by account type.
 *
 * series is [{ key, label }], rows is [{ label, values: { key: number } }].
 */
export function GroupedBars({ title, rows, series, caption }) {
  const t = useT();
  const most = Math.max(1, ...rows.flatMap((row) => series.map((one) => row.values[one.key] ?? 0)));
  const total = rows.reduce(
    (sum, row) => sum + series.reduce((inner, one) => inner + (row.values[one.key] ?? 0), 0),
    0,
  );

  return (
    <section className="admin-chart" aria-labelledby={`chart-${title}`}>
      <h3 id={`chart-${title}`} className="admin-chart__title">
        {title}
      </h3>

      {total === 0 ? (
        <EmptyChart />
      ) : (
        <>
          {/* aria-hidden: the numbers live in the table below, and reading a
              grid of bars aloud is noise. */}
          <div className="admin-bars" aria-hidden="true">
            {rows.map((row) => (
              <div className="admin-bars__group" key={row.label}>
                <div className="admin-bars__stack">
                  {series.map((one) => (
                    <span
                      key={one.key}
                      className={`admin-bars__bar admin-bars__bar--${one.key}`}
                      style={{ height: `${((row.values[one.key] ?? 0) / most) * 100}%` }}
                    />
                  ))}
                </div>
                <span className="admin-bars__label">{row.label.slice(5)}</span>
              </div>
            ))}
          </div>

          <ul className="admin-key" aria-hidden="true">
            {series.map((one) => (
              <li key={one.key}>
                <span className={`admin-key__swatch admin-key__swatch--${one.key}`} />
                {one.label}
              </li>
            ))}
          </ul>

          <ChartTable
            caption={caption}
            columns={[t("admin.week"), ...series.map((one) => one.label)]}
            rows={rows.map((row) => [row.label, ...series.map((one) => row.values[one.key] ?? 0)])}
          />
        </>
      )}
    </section>
  );
}

// The ring's geometry. A circle drawn as one stroked path per segment, each
// offset around the circumference: far less code than five arc paths, and it
// stays a perfect circle at any size.
const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A donut, e.g. interest by pathway.
 *
 * Only two colours exist on this site, so segments alternate between them and
 * are told apart by the key and the percentages rather than by hue: nothing
 * here rests on colour alone, which is the same rule the distance chips and
 * the "selected" tag already follow.
 */
export function Donut({ title, segments, caption }) {
  const t = useT();
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (total === 0) {
    return (
      <section className="admin-chart" aria-labelledby={`chart-${title}`}>
        <h3 id={`chart-${title}`} className="admin-chart__title">
          {title}
        </h3>
        <EmptyChart />
      </section>
    );
  }

  let travelled = 0;
  const drawn = segments
    .filter((segment) => segment.value > 0)
    .map((segment, index) => {
      const share = segment.value / total;
      const piece = {
        ...segment,
        share,
        percent: Math.round(share * 100),
        length: share * CIRCUMFERENCE,
        offset: -travelled * CIRCUMFERENCE,
        tone: index % 2 === 0 ? "orange" : "blue",
      };
      travelled += share;
      return piece;
    });

  return (
    <section className="admin-chart" aria-labelledby={`chart-${title}`}>
      <h3 id={`chart-${title}`} className="admin-chart__title">
        {title}
      </h3>

      <div className="admin-donut">
        {/* Decorative: the same numbers are in the key and the table. */}
        <svg viewBox="0 0 160 160" className="admin-donut__ring" aria-hidden="true" focusable="false">
          <g transform="rotate(-90 80 80)">
            {drawn.map((piece) => (
              <circle
                key={piece.label}
                cx="80"
                cy="80"
                r={RADIUS}
                className={`admin-donut__segment admin-donut__segment--${piece.tone}`}
                strokeDasharray={`${piece.length} ${CIRCUMFERENCE - piece.length}`}
                strokeDashoffset={piece.offset}
              />
            ))}
          </g>
          <text x="80" y="80" className="admin-donut__total" textAnchor="middle" dy="0.35em">
            {total}
          </text>
        </svg>

        <ul className="admin-key admin-key--stacked">
          {drawn.map((piece) => (
            <li key={piece.label}>
              <span className={`admin-key__swatch admin-key__swatch--${piece.tone}`} aria-hidden="true" />
              {piece.label}
              <span className="admin-key__value">
                {piece.percent}% ({piece.value})
              </span>
            </li>
          ))}
        </ul>
      </div>

      <ChartTable
        caption={caption}
        columns={[t("admin.name"), t("admin.count"), t("admin.share")]}
        rows={drawn.map((piece) => [piece.label, piece.value, `${piece.percent}%`])}
      />
    </section>
  );
}
