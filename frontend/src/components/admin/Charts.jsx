import { useState } from "react";
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
  const readout = usePointReadout(rows.length);
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
          <div
            className="admin-plot admin-bars"
            role="group"
            aria-label={t("admin.charts.plotLabel", { title })}
            {...readout.handlers}
          >
            {rows.map((row, index) => (
              <div
                className={`admin-bars__group${
                  readout.at === index ? " admin-bars__group--chosen" : ""
                }`}
                key={row.label}
              >
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

            <PointReadout readout={readout} rows={rows} series={series} formatLabel={label} />
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
export function Donut({ title, segments, caption, centre }) {
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
          {/* The middle is the headline: a share when the caller asks for
              one ("43%" over "answered"), otherwise the plain total. Both are
              repeated in the key and the table, so the SVG text is a
              convenience rather than the only place a number lives. */}
          {centre ? (
            <>
              <text x="80" y="74" className="admin-donut__total" textAnchor="middle">
                {centre.value}
              </text>
              <text x="80" y="96" className="admin-donut__centre-label" textAnchor="middle">
                {centre.label}
              </text>
            </>
          ) : (
            <text x="80" y="80" className="admin-donut__total" textAnchor="middle" dy="0.35em">
              {total}
            </text>
          )}
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
 * Reading one point off a line or a bar chart, by mouse, keyboard or touch.
 *
 * THE ANNOUNCEMENT IS NOT THE TOOLTIP. A popup that only exists on hover is
 * invisible to a screen reader and unreachable without a mouse, so the same
 * numbers go into a permanently-present aria-live region as a sentence, and
 * the floating box is the sighted convenience on top. The live region is
 * rendered ALWAYS, empty when nothing is selected: a live region added to the
 * page at the moment its content changes is frequently not announced at all.
 *
 * KEYBOARD. The plot is one tab stop, not one per point: a year of daily
 * sign-ups would otherwise put 365 stops between the chart and whatever
 * follows it. Arrows move along the points, Home and End jump to either end,
 * Escape clears. Tab is deliberately not handled, so focus leaves normally
 * and nothing is trapped.
 */
function usePointReadout(count) {
  const [at, setAt] = useState(null);

  const move = (to) => setAt(Math.max(0, Math.min(count - 1, to)));

  function onKeyDown(event) {
    if (count === 0) return;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        move(at === null ? 0 : at + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        move(at === null ? count - 1 : at - 1);
        break;
      case "Home":
        event.preventDefault();
        move(0);
        break;
      case "End":
        event.preventDefault();
        move(count - 1);
        break;
      case "Escape":
        // Not stopped from propagating: Escape may mean something to whatever
        // this chart is inside, and clearing a tooltip should not swallow it.
        setAt(null);
        break;
      default:
        break;
    }
  }

  /** Which point an x position over the plot is nearest. */
  function fromPointer(event) {
    if (count === 0) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width === 0) return;
    const share = (event.clientX - box.left) / box.width;
    move(Math.round(share * (count - 1)));
  }

  return {
    at,
    clear: () => setAt(null),
    onKeyDown,
    fromPointer,
    // Touch is a tap on the plot, which arrives as a pointer event; nothing
    // extra is needed beyond not requiring hover.
    handlers: {
      tabIndex: 0,
      onKeyDown,
      onMouseMove: fromPointer,
      onMouseLeave: () => setAt(null),
      onPointerDown: fromPointer,
      onBlur: () => setAt(null),
    },
  };
}

/**
 * What the selected point says, in both forms: a floating box for people who
 * can see it, and a sentence in a live region for people who cannot.
 */
function PointReadout({ readout, rows, series, formatLabel = (label) => label }) {
  const t = useT();
  const row = readout.at === null ? null : rows[readout.at];

  const sentence = row
    ? t("admin.charts.pointReadout", {
        label: formatLabel(row.label),
        values: series
          .map((one) => `${one.label}: ${row.values[one.key] ?? 0}`)
          .join(", "),
      })
    : "";

  return (
    <>
      {row && (
        <div className="admin-readout" aria-hidden="true">
          <p className="admin-readout__label">{formatLabel(row.label)}</p>
          <ul>
            {series.map((one, index) => (
              <li key={one.key}>
                <span className={`admin-key__swatch admin-key__swatch--${toneFor(index)}`} />
                {one.label}
                <span className="admin-readout__value">{row.values[one.key] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Always here, empty when nothing is selected. See the hook's note. */}
      <p className="sr-only" role="status" aria-live="polite">
        {sentence}
      </p>
    </>
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
  // Before the empty-data return: a hook cannot be called conditionally.
  const readout = usePointReadout(rows.length);

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

      {/* One tab stop for the whole plot, with the numbers behind it in the
          readout below rather than in the SVG. */}
      <div
        className="admin-plot"
        role="group"
        aria-label={t("admin.charts.plotLabel", { title })}
        {...readout.handlers}
      >
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

          {/* The selected point, marked on the line itself. */}
          {readout.at !== null &&
            series.map((one, index) => {
              const [x, y] = pointsFor(one)[readout.at];
              return (
                <circle
                  key={one.key}
                  className={`admin-line__marker admin-line__marker--${toneFor(index)}`}
                  cx={x}
                  cy={y}
                  r="1.4"
                />
              );
            })}
        </svg>

        <PointReadout readout={readout} rows={rows} series={series} formatLabel={formatLabel} />
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


/**
 * One bar split into proportional segments, with a legend under it.
 *
 * For "what is this made of" where a ring would be too much: the whole is a
 * single quantity and the parts are shares of it. Segments carry a visible
 * gap so two neighbouring colours never merge into one block, and below about
 * 30rem the bar is decoration: every value and share is in the legend, which
 * is the thing that has to be readable.
 */
export function SegmentedBar({ title, segments, caption, nameColumn }) {
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

  const drawn = segments
    .filter((segment) => segment.value > 0)
    .map((segment, index) => ({
      ...segment,
      tone: toneFor(index),
      percent: Math.round((segment.value / total) * 100),
    }));

  return (
    <section className="admin-chart" aria-labelledby={`chart-${title}`}>
      <h3 id={`chart-${title}`} className="admin-chart__title">
        {title}
      </h3>

      {/* Decorative: the legend below says everything this shows. */}
      <div className="admin-segments" aria-hidden="true">
        {drawn.map((segment) => (
          <span
            key={segment.label}
            className={`admin-segments__part admin-segments__part--${segment.tone}`}
            style={{ flexGrow: segment.value }}
          />
        ))}
      </div>

      <ul className="admin-key admin-key--stacked">
        {drawn.map((segment) => (
          <li key={segment.label}>
            <span className={`admin-key__swatch admin-key__swatch--${segment.tone}`} aria-hidden="true" />
            {segment.label}
            <span className="admin-key__value">
              {segment.percent}% ({segment.value})
            </span>
          </li>
        ))}
      </ul>

      <ChartTable
        caption={caption}
        columns={[nameColumn ?? t("admin.name"), t("admin.count"), t("admin.share")]}
        rows={drawn.map((segment) => [segment.label, segment.value, `${segment.percent}%`])}
      />
    </section>
  );
}

/**
 * A row of dots per category, one dot per bucket of time.
 *
 * Four steps, and NOT by opacity alone: each step also changes the dot's size
 * and whether it is filled, so the pattern survives greyscale and every
 * colour-vision filter. A heat grid that only varies lightness is the classic
 * chart that vanishes for the people this site is built for.
 *
 * Each row carries its own aria-label with the total, because reading fifty
 * dots aloud one at a time is not information.
 */
const STEPS = 4;

function stepFor(value, most) {
  if (value <= 0) return 0;
  // 1..STEPS, so anything above zero is always visible as something.
  return Math.max(1, Math.ceil((value / most) * STEPS));
}

export function DotMatrix({ title, rows, series, caption, formatLabel = (label) => label }) {
  const t = useT();

  const most = Math.max(
    1,
    ...rows.flatMap((row) => series.map((one) => row.values[one.key] ?? 0)),
  );
  const totals = Object.fromEntries(
    series.map((one) => [one.key, rows.reduce((sum, row) => sum + (row.values[one.key] ?? 0), 0)]),
  );
  const anything = Object.values(totals).some((total) => total > 0);

  if (rows.length === 0 || !anything) {
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

      <ul className="admin-dots">
        {series.map((one) => (
          <li className="admin-dots__row" key={one.key}>
            <span className="admin-dots__name">{one.label}</span>
            <span
              className="admin-dots__track"
              /* role="img" with a label: the row of dots IS a picture, and
                 this is its alt text. A bare span has no role to carry an
                 aria-label, which axe rightly refuses. One sentence per row,
                 because fifty dots read out one at a time is not
                 information. */
              role="img"
              aria-label={t("admin.charts.dotRow", {
                name: one.label,
                total: totals[one.key],
                buckets: rows.length,
              })}
            >
              {rows.map((row) => {
                const value = row.values[one.key] ?? 0;
                return (
                  <span
                    key={row.label}
                    className={`admin-dots__dot admin-dots__dot--${stepFor(value, most)}`}
                    aria-hidden="true"
                  />
                );
              })}
            </span>
            <span className="admin-dots__total">{totals[one.key]}</span>
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
 * The nine English regions as a tidy grid of tiles, NOT a geographic map.
 *
 * A real map of England would be a lot of SVG to say what nine labelled boxes
 * say, and it would put the smallest regions in the smallest targets. The
 * grid is roughly north at the top so it still reads as the country, and
 * every tile shows its number as text: the shading is a second signal, never
 * the only one.
 */
export function TileMap({ title, tiles, caption, nameColumn }) {
  const t = useT();
  const most = Math.max(1, ...tiles.map((tile) => tile.value));

  if (tiles.length === 0 || most === 0) {
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

      <ul className="admin-tiles">
        {tiles.map((tile) => (
          <li className={`admin-tiles__tile admin-tiles__tile--${stepFor(tile.value, most)}`} key={tile.label}>
            <span className="admin-tiles__value">{tile.value}</span>
            <span className="admin-tiles__name">{tile.label}</span>
            {tile.note ? <span className="admin-tiles__note">{tile.note}</span> : null}
          </li>
        ))}
      </ul>

      <ChartTable
        caption={caption}
        columns={[nameColumn ?? t("admin.name"), t("admin.count")]}
        rows={tiles.map((tile) => [tile.label, tile.value])}
      />
    </section>
  );
}
