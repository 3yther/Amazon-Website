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

/**
 * Which of the palette's seven series a mark takes, by position.
 *
 * The palette is ORDERED so that neighbours differ in lightness, not just hue
 * (styles.css explains why, and `npm run check:palette` measures it), so the
 * position in the list is the whole point: picking by key name would put teal
 * next to green and lose both in greyscale. Beyond seven it wraps, which is
 * more series than any chart here has.
 */
const PALETTE_SIZE = 7;
export const toneFor = (index) => `s${(index % PALETTE_SIZE) + 1}`;

/** A data table saying exactly what the chart says, for screen readers. */
export function ChartTable({ caption, rows, columns }) {
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
export function GroupedBars({ title, rows, series, caption, formatLabel }) {
  // Labels here are usually ISO weeks, where only the month and day fit.
  // Anything else (a region name, a topic) passes its own formatter.
  const label = formatLabel ?? ((text) => String(text).slice(5));
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
                  {series.map((one, index) => (
                    <span
                      key={one.key}
                      className={`admin-bars__bar admin-bars__bar--${toneFor(index)}`}
                      style={{ height: `${((row.values[one.key] ?? 0) / most) * 100}%` }}
                    />
                  ))}
                </div>
                <span className="admin-bars__label">{label(row.label)}</span>
              </div>
            ))}
          </div>

          <ul className="admin-key" aria-hidden="true">
            {series.map((one, index) => (
              <li key={one.key}>
                <span className={`admin-key__swatch admin-key__swatch--${toneFor(index)}`} />
                {one.label}
              </li>
            ))}
          </ul>

          <ChartTable
            caption={caption}
            columns={[t("admin.week"), ...series.map((one) => one.label)]}
            rows={rows.map((row) => [label(row.label), ...series.map((one) => row.values[one.key] ?? 0)])}
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
 * Segments take their colour from the admin data palette by POSITION, which
 * is ordered so neighbours differ in lightness as well as hue (see
 * styles.css). They are still told apart by the key and the percentages
 * rather than by hue: nothing here rests on colour alone, which is the same
 * rule the distance chips and the "selected" tag already follow.
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
        tone: toneFor(index),
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


/**
 * A line per series over time, with a pale area under it.
 *
 * The one chart here that is not bars, because a trend over twelve months is
 * a shape and bars make you read it point by point. Same contract as the
 * rest: the numbers underneath are the same array the line is drawn from, so
 * the picture and the table cannot drift apart.
 *
 * Lines are told apart by the key and by the table, never by colour alone.
 * The area fills are the palette's pale tints, which exist for exactly this
 * and nothing else.
 */
export function LineChart({ title, rows, series, caption, formatLabel = (label) => label }) {
  const t = useT();

  const most = Math.max(1, ...rows.flatMap((row) => series.map((one) => row.values[one.key] ?? 0)));
  const total = rows.reduce(
    (sum, row) => sum + series.reduce((inner, one) => inner + (row.values[one.key] ?? 0), 0),
    0,
  );

  if (rows.length < 2 || total === 0) {
    return (
      <section className="admin-chart" aria-labelledby={`chart-${title}`}>
        <h3 id={`chart-${title}`} className="admin-chart__title">
          {title}
        </h3>
        <EmptyChart />
      </section>
    );
  }

  const step = 100 / (rows.length - 1);
  const pointsFor = (one) =>
    rows.map((row, index) => [index * step, 40 - ((row.values[one.key] ?? 0) / most) * 38]);

  return (
    <section className="admin-chart" aria-labelledby={`chart-${title}`}>
      <h3 id={`chart-${title}`} className="admin-chart__title">
        {title}
      </h3>

      {/* Decorative: every number is in the key and the table below. */}
      <svg
        className="admin-line"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {series.map((one, index) => {
          const points = pointsFor(one);
          const line = points.map(([x, y]) => `${x},${y}`).join(" ");
          // Closed back along the baseline, so the fill has a bottom edge.
          const area = `${line} ${100},40 0,40`;
          return (
            <g key={one.key}>
              <polygon className={`admin-line__area admin-line__area--${toneFor(index)}`} points={area} />
              <polyline className={`admin-line__line admin-line__line--${toneFor(index)}`} points={line} />
            </g>
          );
        })}
      </svg>

      <ul className="admin-key" aria-hidden="true">
        {series.map((one, index) => (
          <li key={one.key}>
            <span className={`admin-key__swatch admin-key__swatch--${toneFor(index)}`} />
            {one.label}
          </li>
        ))}
      </ul>

      <ChartTable
        caption={caption}
        columns={[t("admin.week"), ...series.map((one) => one.label)]}
        rows={rows.map((row) => [
          formatLabel(row.label),
          ...series.map((one) => row.values[one.key] ?? 0),
        ])}
      />
    </section>
  );
}

/**
 * A plain horizontal bar per row, for "most of X" lists: topics, languages,
 * providers per region. A ring would be wrong for these because there are too
 * many slices and no meaningful whole.
 */
export function RankedBars({ title, rows, caption, nameColumn }) {
  const t = useT();
  const most = Math.max(1, ...rows.map((row) => row.value));

  if (rows.length === 0 || most === 0) {
    return (
      <section className="admin-chart" aria-labelledby={`chart-${title}`}>
        <h3 id={`chart-${title}`} className="admin-chart__title">
          {title}
        </h3>
        <EmptyChart />
      </section>
    );
  }

  return (
    <section className="admin-chart" aria-labelledby={`chart-${title}`}>
      <h3 id={`chart-${title}`} className="admin-chart__title">
        {title}
      </h3>

      {/* The value sits beside every bar, so the length is a convenience
          rather than the only way to read it. */}
      <ul className="admin-ranked" aria-hidden="true">
        {rows.map((row, index) => (
          <li className="admin-ranked__row" key={row.label}>
            <span className="admin-ranked__name">{row.label}</span>
            <span className="admin-ranked__track">
              <span
                className={`admin-ranked__bar admin-ranked__bar--${toneFor(index)}`}
                style={{ width: `${(row.value / most) * 100}%` }}
              />
            </span>
            <span className="admin-ranked__value">{row.value}</span>
          </li>
        ))}
      </ul>

      <ChartTable
        caption={caption}
        columns={[nameColumn ?? t("admin.name"), t("admin.count")]}
        rows={rows.map((row) => [row.label, row.value])}
      />
    </section>
  );
}
