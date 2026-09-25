import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getContent, getPathways } from "../api.js";
import { AlertIcon, ArrowIcon, LockIcon, PATHWAY_ICONS } from "../components/Icons.jsx";
import Pictogram from "../components/Pictogram.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import "../about.css";

const NO_FILTERS = { pathway: "", audience: "", access_level: "" };

// The picture shown beside each content type's label.
const TYPE_PICTURES = {
  guide: "book",
  document: "document",
  video: "video",
  prep_pack: "clipboard",
  class_pack: "folder",
};

// Short site name for the "Open on ..." button, or null if the link is broken.
// Any gov.uk address just says "gov.uk".
export function siteName(link) {
  let host;
  try {
    host = new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  return host === "gov.uk" || host.endsWith(".gov.uk") ? "gov.uk" : host;
}

// The resources page. /resources?pathway=digital opens it filtered to that pathway.
export default function ContentLibrary() {
  const t = useT();
  const [searchParams] = useSearchParams();
  const [pathways, setPathways] = useState([]);
  const [filters, setFilters] = useState(() => ({
    ...NO_FILTERS,
    pathway: searchParams.get("pathway") ?? "",
  }));
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [attempt, setAttempt] = useState(0); // bump to retry after an error

  useEffect(() => {
    const controller = new AbortController();
    getPathways({ signal: controller.signal })
      .then((list) => {
        setPathways(list);
        // Drop a pathway from the address that doesn't exist (the API would reject it).
        setFilters((current) =>
          current.pathway && !list.some((pathway) => pathway.slug === current.pathway)
            ? { ...current, pathway: "" }
            : current,
        );
      })
      .catch(() => {}); // the content request below reports a dead API
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getContent({ ...filters, page }, { signal: controller.signal })
      .then((data) => {
        setItems((previous) => (page === 1 ? data.results : [...previous, ...data.results]));
        setCount(data.count);
        setHasMore(Boolean(data.next));
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [filters, page, attempt]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(NO_FILTERS);
    setPage(1);
  }

  const filtered = Object.values(filters).some(Boolean);

  let summary;
  if (status === "loading" && items.length === 0) summary = t("resources.loading");
  else if (count === 0) summary = t("resources.noMatches");
  else if (count === 1) summary = t("resources.oneItem");
  else summary = t("resources.items", { count });

  return (
    <section aria-labelledby="page-title">
      <div className="intro">
        <p className="label">{t("resources.label")}</p>
        <h1 id="page-title">{t("resources.title")}</h1>
        <p className="lead">{t("resources.lead")}</p>
      </div>

      <form className="filters" aria-label={t("resources.filters")} onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label className="label" htmlFor="filter-pathway">
            {t("resources.pathway")}
          </label>
          <select id="filter-pathway" name="pathway" value={filters.pathway} onChange={updateFilter}>
            <option value="">{t("resources.allPathways")}</option>
            {pathways.map((pathway) => (
              <option key={pathway.slug} value={pathway.slug}>
                {t(`pathways.${pathway.slug}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="filter-audience">
            {t("resources.for")}
          </label>
          <select id="filter-audience" name="audience" value={filters.audience} onChange={updateFilter}>
            <option value="">{t("resources.anyone")}</option>
            {["student", "parent", "teacher"].map((audience) => (
              <option key={audience} value={audience}>
                {t(`resources.audiences.${audience}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="filter-access">
            {t("resources.access")}
          </label>
          <select id="filter-access" name="access_level" value={filters.access_level} onChange={updateFilter}>
            <option value="">{t("resources.any")}</option>
            <option value="free">{t("resources.accessLevels.free")}</option>
            <option value="signup">{t("resources.accessLevels.signup")}</option>
          </select>
        </div>

        {filtered && (
          <button type="button" className="button filters__clear" onClick={clearFilters}>
            {t("resources.clear")}
          </button>
        )}
      </form>

      {status === "error" ? (
        <div className="notice" role="alert">
          <AlertIcon />
          <div>
            <p className="notice__title">{t("resources.loadError")}</p>
            <p>
              {import.meta.env.DEV
                ? "Check the Django API is running on port 8000, then try again."
                : t("resources.serverError")}
            </p>
            <button type="button" className="button" onClick={() => setAttempt((n) => n + 1)}>
              {t("resources.tryAgain")}
            </button>
          </div>
        </div>
      ) : (
        <p className="label results-status" role="status">
          {summary}
        </p>
      )}

      {items.length > 0 && status !== "error" && (
        <ul className="card-grid" aria-busy={status === "loading"}>
          {items.map((item) => (
            <ContentCard key={item.slug} item={item} />
          ))}
        </ul>
      )}

      {hasMore && status !== "error" && (
        <div className="load-more">
          <button
            type="button"
            className="button"
            disabled={status === "loading"}
            onClick={() => setPage((n) => n + 1)}
          >
            {status === "loading" ? t("resources.loading") : t("resources.loadMore")}
          </button>
        </div>
      )}
    </section>
  );
}

function ContentCard({ item }) {
  const t = useT();
  const signupOnly = item.access_level === "signup";
  const PathwayIcon = item.pathway ? PATHWAY_ICONS[item.pathway.slug] : null;

  return (
    <li className="card">
      <div className="card__tags">
        <span className="label card__type">
          <Pictogram name={TYPE_PICTURES[item.content_type]} size="small" />
          {t(`resources.types.${item.content_type}`)}
        </span>
        <span className={signupOnly ? "tag tag--signup" : "tag"}>
          {t(`resources.accessLevels.${item.access_level}`)}
        </span>
      </div>

      {/* h2 because the cards sit straight under the page's h1 */}
      <h2 className="card__title">{item.title}</h2>
      <p className="card__text">{item.description}</p>

      <dl className="card__meta">
        <div>
          <dt className="label">{t("resources.pathway")}</dt>
          <dd className="card__pathway">
            {PathwayIcon && <PathwayIcon />}
            {item.pathway ? t(`pathways.${item.pathway.slug}`) : t("resources.allPathways")}
          </dd>
        </div>
        <div>
          <dt className="label">{t("resources.for")}</dt>
          <dd>{t(`resources.audiences.${item.audience}`)}</dd>
        </div>
      </dl>

      {item.locked ? (
        <Link className="card__locked" to="/register">
          <LockIcon />
          {t("resources.signUp")}
        </Link>
      ) : (
        <>
          {item.link && (
            <a className="button button--primary card__action" href={item.link}>
              {t("resources.openOn", { site: siteName(item.link) ?? t("resources.anotherWebsite") })}
              <span className="sr-only">, {item.title}</span>
              <ArrowIcon />
            </a>
          )}
          {item.file && (
            <a className="button button--primary card__action" href={item.file}>
              {t("resources.open")}
              <span className="sr-only"> {item.title}</span>
              <ArrowIcon />
            </a>
          )}
        </>
      )}
    </li>
  );
}
