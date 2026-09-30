import { useT } from "../../i18n/I18nProvider.jsx";
import ExportButton from "./ExportButton.jsx";
import { RANGES } from "./useDashboardFilters.js";

/**
 * The filter bar under the dashboard heading, shared by the Overview and the
 * data tabs so they always mean the same thing by "last 30 days".
 *
 * Plain selects rather than a custom dropdown: these are one-of-a-list
 * choices, and the browser's own control is already keyboard operable, works
 * with every screen reader and opens as a native picker on a phone. Nothing
 * here is worth reimplementing.
 *
 * Changing anything rewrites the URL (see useDashboardFilters), which is what
 * makes a filtered view something you can send to somebody.
 */
export default function FilterBar({
  filters,
  range,
  setFilter,
  clearAll,
  anySet,
  showUserType = false,
  showPathway = false,
  pathways = [],
  busy = false,
  exportUrl,
  exportQuery,
}) {
  const t = useT();

  return (
    <div className="admin-filters" role="group" aria-label={t("admin.filters.title")}>
      <div className="admin-filters__field">
        <label className="label" htmlFor="admin-range">
          {t("admin.filters.range")}
        </label>
        <select
          id="admin-range"
          value={range}
          onChange={(event) => setFilter("range", event.target.value)}
        >
          {RANGES.map((option) => (
            <option key={option} value={option}>
              {t(`admin.filters.ranges.${option}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Only with Custom chosen: two empty date boxes that do nothing are
          worse than no boxes at all. */}
      {range === "custom" && (
        <>
          <div className="admin-filters__field">
            <label className="label" htmlFor="admin-from">
              {t("admin.filters.from")}
            </label>
            <input
              id="admin-from"
              type="date"
              value={filters.from ?? ""}
              onChange={(event) => setFilter("from", event.target.value)}
            />
          </div>
          <div className="admin-filters__field">
            <label className="label" htmlFor="admin-to">
              {t("admin.filters.to")}
            </label>
            <input
              id="admin-to"
              type="date"
              value={filters.to ?? ""}
              onChange={(event) => setFilter("to", event.target.value)}
            />
          </div>
        </>
      )}

      {showUserType && (
        <div className="admin-filters__field">
          <label className="label" htmlFor="admin-user-type">
            {t("admin.filters.userType")}
          </label>
          <select
            id="admin-user-type"
            value={filters.user_type ?? ""}
            onChange={(event) => setFilter("user_type", event.target.value)}
          >
            <option value="">{t("admin.allOf")}</option>
            {["student", "parent", "teacher", "amazon_staff"].map((type) => (
              <option key={type} value={type}>
                {t(`account.roles.${type}`)}
              </option>
            ))}
          </select>
        </div>
      )}

      {showPathway && pathways.length > 0 && (
        <div className="admin-filters__field">
          <label className="label" htmlFor="admin-pathway">
            {t("admin.filters.pathway")}
          </label>
          <select
            id="admin-pathway"
            value={filters.pathway ?? ""}
            onChange={(event) => setFilter("pathway", event.target.value)}
          >
            <option value="">{t("admin.allOf")}</option>
            {pathways.map((pathway) => (
              <option key={pathway} value={pathway}>
                {pathway}
              </option>
            ))}
          </select>
        </div>
      )}

      {anySet && (
        <button type="button" className="button admin-filters__clear" onClick={clearAll}>
          {t("admin.filters.clear")}
        </button>
      )}

      {/* The export sits with the filters because that is what it exports. */}
      {exportUrl && (
        <div className="admin-filters__export">
          <ExportButton url={exportUrl} query={exportQuery} />
        </div>
      )}

      {/* Announced, not just spun: somebody using a screen reader needs to
          know the numbers under this are being replaced. */}
      <p className="sr-only" role="status">
        {busy ? t("admin.filters.updating") : ""}
      </p>
    </div>
  );
}
