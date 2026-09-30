import { useCallback, useEffect, useState } from "react";
import { adminDashboard, adminDashboardCharts } from "../../api.js";
import { useT } from "../../i18n/I18nProvider.jsx";
import { Donut, GroupedBars, LineChart, RankedBars } from "./Charts.jsx";
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
            <LineChart
              title={t("admin.charts.signups")}
              caption={t("admin.charts.signupsCaption")}
              rows={charts.data.signups_over_time}
              formatLabel={shortDate}
              series={[
                { key: "student", label: t("account.roles.student") },
                { key: "parent", label: t("account.roles.parent") },
                { key: "teacher", label: t("account.roles.teacher") },
              ]}
            />

            <Donut
              title={t("admin.charts.usersByType")}
              caption={t("admin.charts.usersByTypeCaption")}
              segments={charts.data.users_by_type.map((row) => ({
                ...row,
                label: t(`account.roles.${row.label}`),
              }))}
            />

            <RankedBars
              title={t("admin.charts.interest")}
              caption={t("admin.charts.interestCaption")}
              rows={charts.data.interest_by_pathway}
            />

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

            <Donut
              title={t("admin.charts.answerRate")}
              caption={t("admin.charts.answerRateCaption")}
              segments={charts.data.answer_rate}
            />

            <RankedBars
              title={t("admin.charts.topics")}
              caption={t("admin.charts.topicsCaption")}
              rows={charts.data.active_topics}
            />

            <LineChart
              title={t("admin.charts.feedbackOverTime")}
              caption={t("admin.charts.feedbackOverTimeCaption")}
              rows={charts.data.feedback_over_time}
              formatLabel={shortDate}
              series={[
                { key: "bug", label: t("feedbackPage.categories.bug") },
                { key: "feature", label: t("feedbackPage.categories.feature") },
                { key: "general", label: t("feedbackPage.categories.general") },
                { key: "accessibility", label: t("feedbackPage.categories.accessibility") },
              ]}
            />

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

            <RankedBars
              title={t("admin.charts.languages")}
              caption={t("admin.charts.languagesCaption")}
              rows={charts.data.languages}
              nameColumn={t("admin.charts.language")}
            />

            <GroupedBars
              title={t("admin.charts.providers")}
              caption={t("admin.charts.providersCaption")}
              rows={charts.data.provider_coverage}
              formatLabel={(label) => label}
              series={[
                { key: "placed", label: t("admin.charts.placed") },
                { key: "unplaced", label: t("admin.charts.unplaced") },
              ]}
            />
          </div>
        ) : (
          <Skeleton lines={6} label={t("admin.charts.loading")} />
        )}
      </section>
    </div>
  );
}
