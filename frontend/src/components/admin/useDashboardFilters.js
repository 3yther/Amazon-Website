import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * The dashboard's filters, kept in the URL rather than in component state.
 *
 * WHY THE URL. A staff member who has narrowed the Overview to the last 90
 * days of Digital sign-ups should be able to send that to a colleague, or
 * bookmark it and come back on Monday. State in useState cannot be sent to
 * anybody. It also means the CSV export and the numbers on screen read their
 * filters from one place, so a downloaded file always matches the chart it
 * was taken from.
 *
 * Defaults are NOT written to the URL. A bare /admin-portal stays bare, and
 * only what somebody actually changed shows up, so the link they copy says
 * what they chose rather than restating every default.
 */

export const RANGES = ["7d", "30d", "90d", "12m", "all", "custom"];
export const DEFAULT_RANGE = "30d";

/** Only the filters the server understands, and only when they are set. */
function cleaned(params) {
  const filters = {};
  const range = params.get("range");
  if (range && RANGES.includes(range)) filters.range = range;

  if (filters.range === "custom") {
    if (params.get("from")) filters.from = params.get("from");
    if (params.get("to")) filters.to = params.get("to");
  }

  for (const key of ["user_type", "pathway"]) {
    if (params.get(key)) filters[key] = params.get(key);
  }
  return filters;
}

export default function useDashboardFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // A stable object for the effects that fetch on it. Keyed off the query
  // string rather than the params object, which is new on every render.
  const key = searchParams.toString();
  const filters = useMemo(() => cleaned(new URLSearchParams(key)), [key]);

  const setFilter = useCallback(
    (name, value) => {
      const next = new URLSearchParams(searchParams);
      // An empty value or the default means "not chosen", so it leaves the URL
      // rather than sitting there as range=30d.
      if (!value || (name === "range" && value === DEFAULT_RANGE)) {
        next.delete(name);
      } else {
        next.set(name, value);
      }

      // Custom dates only mean anything with range=custom on.
      if (name === "range" && value !== "custom") {
        next.delete("from");
        next.delete("to");
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    for (const name of ["range", "from", "to", "user_type", "pathway"]) next.delete(name);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return {
    filters,
    range: filters.range ?? DEFAULT_RANGE,
    setFilter,
    clearAll,
    // What the CSV export appends, so the file matches what is on screen.
    asQueryString: new URLSearchParams(filters).toString(),
    anySet: Object.keys(filters).length > 0,
  };
}
