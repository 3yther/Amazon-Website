import { useCallback, useEffect, useState } from "react";
import { adminDashboard, adminDashboardCharts } from "../../api.js";
import { useT } from "../../i18n/I18nProvider.jsx";
import { Donut, DotMatrix, GroupedBars, RankedBars, SegmentedBar, TileMap } from "./Charts.jsx";
import SignupsCard from "./SignupsCard.jsx";
import KpiCard from "./KpiCard.jsx";
import { ErrorState, Skeleton } from "./States.jsx";

/**
 * The Overview: ten KPI cards and the charts under them.
 *
 * Two requests rather than one. The cards are the thing somebody came to see
 * and they are cheap; the charts are ten series and slower. Splitting them
 * means the numbers land first and the charts fill in, instead of everything
 * waiting for the slowest query. They fail independently too, so a chart
 * falling over does not take the totals with it.
 */

/**
 * Feedback by category, totalled from the over-time series.
 *
 * The server already sends those numbers per bucket; asking it for the same
 * totals a second way would be a second source of truth for one figure.
 */
function categoriesFrom(overTime, t) {
  const totals = {};
  for (const row of overTime ?? []) {
    for (const [category, value] of Object.entries(row.values)) {
      totals[category] = (totals[category] ?? 0) + value;
    }
  }
  return Object.entries(totals).map(([category, value]) => ({
    label: t(`feedbackPage.categories.${category}`),
    value,
  }));
}

/** "43%" for the first of two segments, or a dash when there is nothing yet. */
function shareOf(segments) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total === 0) return null;
  return `${Math.round((segments[0].value / total) * 100)}%`;
}

/** The week labels come back as ISO dates; only the month and day fit. */
const shortDate = (label) => (typeof label === "string" ? label.slice(5) : label);

/** One fetch with loading, error and retry, shared by both halves. */
function useDashboardData(fetcher, filters) {
  const [state, setState] = useState({ status: "loading", data: null });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  const key = new URLSearchParams(filters).toString();

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ status: "loading", data: current.data }));

    fetcher(Object.fromEntries(new URLSearchParams(key)))
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch(() => !cancelled && setState({ status: "error", data: null }));

    return () => {
      cancelled = true;
    };
  }, [fetcher, key, attempt]);

  return { ...state, retry };
}

export default function Overview({ filters }) {
  const t = useT();
  const cards = useDashboardData(adminDashboard, filters);
  const charts = useDashboardData(adminDashboardCharts, filters);

  return (
    <div className="admin-overview">
      <section aria-labelledby="kpi-title">
        <h2 id="kpi-title" className="sr-only">
          {t("admin.kpis.title")}
        </h2>

        {cards.status === "error" ? (
          <ErrorState onRetry={cards.retry} />
        ) : cards.data ? (
          <div className="admin-kpis">
            {cards.data.kpis.map((card) => (
              <KpiCard card={card} key={card.key} />
            ))}
          </div>
        ) : (
          <Skeleton lines={5} label={t("admin.kpis.loading")} />
        )}
      </section>

      <section aria-labelledby="charts-title">
        <h2 id="charts-title" className="sr-only">
          {t("admin.charts.title")}
        </h2>

        {charts.status === "error" ? (
          <ErrorState onRetry={charts.retry} />
        ) : charts.data ? (
          <div className="admin-charts">
            {/* The lead: one large chart with its own range toggle. */}
            <SignupsCard
              filters={filters}
              rows={charts.data.signups_over_time}
              series={[
                { key: "student", label: t("account.roles.student") },
                { key: "parent", label: t("account.roles.parent") },
                { key: "teacher", label: t("account.roles.teacher") },
              ]}
            />

            {/* Two rings, each with its headline share in the middle. */}
            <div className="admin-card">
              <Donut
                title={t("admin.charts.answerRate")}
                caption={t("admin.charts.answerRateCaption")}
                segments={charts.data.answer_rate}
                centre={
                  shareOf(charts.data.answer_rate)
                    ? { value: shareOf(charts.data.answer_rate), label: t("admin.charts.answered") }
                    : undefined
                }
              />
            </div>

            <div className="admin-card">
              <Donut
                title={t("admin.charts.feedbackHandled")}
                caption={t("admin.charts.feedbackHandledCaption")}
                segments={charts.data.feedback_handled ?? []}
                centre={
                  shareOf(charts.data.feedback_handled ?? [])
                    ? {
                        value: shareOf(charts.data.feedback_handled),
                        label: t("admin.charts.dealtWith"),
                      }
                    : undefined
                }
              />
            </div>

            {/* Three "what is this made of" splits, as one bar each. */}
            <div className="admin-card">
              <SegmentedBar
                title={t("admin.charts.usersByType")}
                caption={t("admin.charts.usersByTypeCaption")}
                segments={charts.data.users_by_type.map((segment) => ({
                  ...segment,
                  label: t(`account.roles.${segment.label}`),
                }))}
              />
            </div>

            <div className="admin-card">
              <SegmentedBar
                title={t("admin.charts.interest")}
                caption={t("admin.charts.interestCaption")}
                segments={charts.data.interest_by_pathway}
                nameColumn={t("admin.filters.pathway")}
              />
            </div>

            <div className="admin-card">
              <SegmentedBar
                title={t("admin.charts.feedbackByCategory")}
                caption={t("admin.charts.feedbackOverTimeCaption")}
                segments={categoriesFrom(charts.data.feedback_over_time, t)}
              />
            </div>

            {/* Activity as dots: one row per account type, one dot per bucket. */}
            <div className="admin-card admin-card--wide">
              <DotMatrix
                title={t("admin.charts.activity")}
                caption={t("admin.charts.activityCaption")}
                rows={charts.data.signups_over_time}
                formatLabel={shortDate}
                series={[
                  { key: "student", label: t("account.roles.student") },
                  { key: "parent", label: t("account.roles.parent") },
                  { key: "teacher", label: t("account.roles.teacher") },
                ]}
              />
            </div>

            <div className="admin-card">
              <GroupedBars
                title={t("admin.charts.community")}
                caption={t("admin.charts.communityCaption")}
                rows={charts.data.community_activity}
                formatLabel={shortDate}
                series={[
                  { key: "questions", label: t("admin.totals.questions") },
                  { key: "answers", label: t("admin.totals.answers") },
                ]}
              />
            </div>

            <div className="admin-card">
              <GroupedBars
                title={t("admin.charts.reports")}
                caption={t("admin.charts.reportsCaption")}
                rows={charts.data.reports_activity}
                formatLabel={shortDate}
                series={[
                  { key: "opened", label: t("admin.charts.opened") },
                  { key: "resolved", label: t("admin.charts.resolved") },
                ]}
              />
            </div>

            <div className="admin-card">
              <RankedBars
                title={t("admin.charts.topics")}
                caption={t("admin.charts.topicsCaption")}
                rows={charts.data.active_topics}
              />
            </div>

            <div className="admin-card">
              <RankedBars
                title={t("admin.charts.languages")}
                caption={t("admin.charts.languagesCaption")}
                rows={charts.data.languages}
                nameColumn={t("admin.charts.language")}
              />
            </div>

            {/* The nine regions as tiles rather than a map: see TileMap. */}
            <div className="admin-card admin-card--wide">
              <TileMap
                title={t("admin.charts.providers")}
                caption={t("admin.charts.providersCaption")}
                nameColumn={t("admin.charts.region")}
                tiles={(charts.data.provider_coverage ?? []).map((region) => ({
                  label: region.label,
                  value: region.values.placed,
                  note:
                    region.values.unplaced > 0
                      ? t("admin.charts.needFixing", { count: region.values.unplaced })
                      : "",
                }))}
              />
            </div>
          </div>
        ) : (
          <Skeleton lines={6} label={t("admin.charts.loading")} />
        )}
      </section>
    </div>
  );
}
