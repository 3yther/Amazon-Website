import { useEffect, useState } from "react";
import { adminDashboardCharts } from "../../api.js";
import { useT } from "../../i18n/I18nProvider.jsx";
import { LineChart } from "./Charts.jsx";
import { Skeleton } from "./States.jsx";

/**
 * The lead chart: sign-ups over time, with its own range toggle.
 *
 * WHY THIS ONE CARD HAS ITS OWN RANGE. "How are sign-ups doing this week"
 * and "how has the year gone" are two different questions somebody asks one
 * after the other, and making them re-filter the whole dashboard to ask the
 * second is the kind of friction that stops people looking.
 *
 * IN SYNC WITH THE PAGE, NOT INDEPENDENT OF IT. It starts on whatever the
 * filter bar says and follows it whenever that changes, so the two never
 * quietly disagree. Only a deliberate press of the toggle makes this card
 * differ, and then only until the page filter moves again.
 *
 * A radiogroup, not buttons: these are one-of-three, which is what radios
 * are, and it gives arrow-key movement between them for nothing.
 */

const RANGES = ["7d", "30d", "12m"];

export default function SignupsCard({ filters, rows, series }) {
  const t = useT();
  const pageRange = filters.range ?? "30d";

  // Follows the page's range, including back to a value this toggle cannot
  // show (90 days, all time), in which case no option is selected.
  const [range, setRange] = useState(pageRange);
  useEffect(() => setRange(pageRange), [pageRange]);

  const [own, setOwn] = useState(null);
  const [loading, setLoading] = useState(false);
  const differs = range !== pageRange;

  useEffect(() => {
    if (!differs) {
      setOwn(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    adminDashboardCharts({ ...filters, range })
      .then((result) => !cancelled && setOwn(result.signups_over_time))
      .catch(() => !cancelled && setOwn([]))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [differs, range, JSON.stringify(filters)]);

  const shown = differs ? own : rows;

  return (
    <div className="admin-card admin-card--lead">
      <div className="admin-card__controls">
        <div
          className="admin-toggle"
          role="radiogroup"
          aria-label={t("admin.charts.rangeFor", { title: t("admin.charts.signups") })}
        >
          {RANGES.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={range === option}
              className="admin-toggle__option"
              onClick={() => setRange(option)}
            >
              {t(`admin.filters.ranges.${option}`)}
            </button>
          ))}
        </div>
      </div>

      {loading && !shown ? (
        <Skeleton lines={3} />
      ) : (
        <LineChart
          title={t("admin.charts.signups")}
          caption={t("admin.charts.signupsCaption")}
          rows={shown ?? []}
          formatLabel={(label) => (typeof label === "string" ? label.slice(5) : label)}
          series={series}
        />
      )}
    </div>
  );
}
