import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getContent, getPathways } from "../api.js";
import { ACCESS_LEVELS, AUDIENCES, CONTENT_TYPES } from "../labels.js";
import {
  AlertIcon,
  ArrowIcon,
  BusinessIcon,
  DigitalIcon,
  EngineeringIcon,
  FinanceIcon,
  LockIcon,
  MediaIcon,
} from "../components/Icons.jsx";
import Pictogram from "../components/Pictogram.jsx";
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

// The same pathway icons the homepage tiles use, keyed by pathway slug.
const PATHWAY_ICONS = {
  digital: DigitalIcon,
  business: BusinessIcon,
  media: MediaIcon,
  finance: FinanceIcon,
  engineering: EngineeringIcon,
};

// Short site name for the "Open on ..." button. Any gov.uk address just says "gov.uk".
export function siteName(link) {
  let host;
  try {
    host = new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "another website";
  }
  return host === "gov.uk" || host.endsWith(".gov.uk") ? "gov.uk" : host;
}

// The resources page. /resources?pathway=digital opens it filtered to that pathway.
export default function ContentLibrary() {
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
        // Drop a pathway from the address that does not exist, which the API
        // would otherwise reject.
        setFilters((current) =>
          current.pathway && !list.some((pathway) => pathway.slug === current.pathway)
            ? { ...current, pathway: "" }
            : current,
        );
      })
      .catch(() => {}); // a dead API is reported by the content request below
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

  return (
    <>
      <section aria-labelledby="page-title">
        <div className="intro">
          <p className="label">Resources</p>
          <h1 id="page-title">T-Level Resources</h1>
          <p className="lead">
            Free guides, videos and packs, linked from official sources such as gov.uk and UCAS.
          </p>
        </div>

        <form className="filters" aria-label="Filter content" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label className="label" htmlFor="filter-pathway">
              Pathway
            </label>
            <select id="filter-pathway" name="pathway" value={filters.pathway} onChange={updateFilter}>
              <option value="">All pathways</option>
              {pathways.map((pathway) => (
                <option key={pathway.slug} value={pathway.slug}>
                  {pathway.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="filter-audience">
              For
            </label>
            <select id="filter-audience" name="audience" value={filters.audience} onChange={updateFilter}>
              <option value="">Anyone</option>
              <option value="student">{AUDIENCES.student}</option>
              <option value="parent">{AUDIENCES.parent}</option>
              <option value="teacher">{AUDIENCES.teacher}</option>
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="filter-access">
              Access
            </label>
            <select
              id="filter-access"
              name="access_level"
              value={filters.access_level}
              onChange={updateFilter}
            >
              <option value="">Any</option>
              <option value="free">{ACCESS_LEVELS.free}</option>
              <option value="signup">{ACCESS_LEVELS.signup}</option>
            </select>
          </div>

          {filtered && (
            <button type="button" className="button filters__clear" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </form>

        {status === "error" ? (
          <div className="notice" role="alert">
            <AlertIcon />
            <div>
              <p className="notice__title">Could not load content.</p>
              <p>
                {import.meta.env.DEV
                  ? "Check the Django API is running on port 8000, then try again."
                  : "Something went wrong on our side. Please try again in a moment."}
              </p>
              <button type="button" className="button" onClick={() => setAttempt((n) => n + 1)}>
                Try again
              </button>
            </div>
          </div>
        ) : (
          <p className="label results-status" role="status">
            {status === "loading" && items.length === 0
              ? "Loading"
              : count === 0
                ? "No content matches these filters."
                : `${count} ${count === 1 ? "item" : "items"}`}
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
              {status === "loading" ? "Loading" : "Load more"}
            </button>
          </div>
        )}
      </section>
    </>
  );
}

function ContentCard({ item }) {
  const signupOnly = item.access_level === "signup";
  const PathwayIcon = item.pathway ? PATHWAY_ICONS[item.pathway.slug] : null;

  return (
    <li className="card">
      <div className="card__tags">
        <span className="label card__type">
          <Pictogram name={TYPE_PICTURES[item.content_type]} size="small" />
          {CONTENT_TYPES[item.content_type] ?? item.content_type}
        </span>
        <span className={signupOnly ? "tag tag--signup" : "tag"}>
          {ACCESS_LEVELS[item.access_level]}
        </span>
      </div>

      {/* h2: the cards sit straight under the page's h1. */}
      <h2 className="card__title">{item.title}</h2>
      <p className="card__text">{item.description}</p>

      <dl className="card__meta">
        <div>
          <dt className="label">Pathway</dt>
          <dd className="card__pathway">
            {PathwayIcon && <PathwayIcon />}
            {item.pathway ? item.pathway.name : "All pathways"}
          </dd>
        </div>
        <div>
          <dt className="label">For</dt>
          <dd>{AUDIENCES[item.audience]}</dd>
        </div>
      </dl>

      {item.locked ? (
        <Link className="card__locked" to="/register">
          <LockIcon />
          Sign up to access
        </Link>
      ) : (
        <>
          {item.link && (
            <a className="button button--primary card__action" href={item.link}>
              Open on {siteName(item.link)}
              <span className="sr-only">, {item.title}</span>
              <ArrowIcon />
            </a>
          )}
          {item.file && (
            <a className="button button--primary card__action" href={item.file}>
              Open<span className="sr-only"> {item.title}</span>
              <ArrowIcon />
            </a>
          )}
        </>
      )}
    </li>
  );
}
