import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPathways, getQuestions } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Author, Notice, TOPICS, useFormatDate } from "../community/CommunityParts.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

const NO_FILTERS = { topic: "", pathway: "", sort: "new", q: "" };

// The Community page. Anyone can read, but you need an account to post.
// Posts are checked before they go up (see backend/community).
export default function Community() {
  const t = useT();
  const formatDate = useFormatDate();
  const { user, checked } = useAuth();

  const [pathways, setPathways] = useState([]);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [count, setCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getPathways({ signal: controller.signal })
      .then(setPathways)
      .catch(() => {}); // the question list reports a dead API itself
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getQuestions({ ...filters, page }, { signal: controller.signal })
      .then((data) => {
        setQuestions((previous) => (page === 1 ? data.results : [...previous, ...data.results]));
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

  function runSearch(event) {
    event.preventDefault();
    setFilters((current) => ({ ...current, q: search.trim() }));
    setPage(1);
  }

  const askLink = checked && user ? "/community/ask" : "/login";

  return (
    <section aria-labelledby="page-title">
      <div className="intro">
        <p className="label">{t("community.label")}</p>
        <h1 id="page-title">{t("community.title")}</h1>
        <p className="lead">{t("community.lead")}</p>
      </div>

      <p className="community-caveat">{t("community.notChecked")}</p>

      <div className="community-toolbar">
        <Link className="button button--primary" to={askLink}>
          {checked && user ? t("community.ask") : t("community.signInToAsk")}
        </Link>
        <Link className="button" to="/faqs">
          {t("community.readFaqs")}
        </Link>
      </div>

      <form className="community-search" role="search" onSubmit={runSearch}>
        <label className="label" htmlFor="community-search">
          {t("community.search")}
        </label>
        <div className="community-search__row">
          <input
            id="community-search"
            type="search"
            value={search}
            placeholder={t("community.searchPlaceholder")}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit" className="button">
            {t("community.searchButton")}
          </button>
        </div>
      </form>

      <form className="filters" aria-label={t("community.filters")} onSubmit={(event) => event.preventDefault()}>
        <div className="field">
          <label className="label" htmlFor="community-topic">
            {t("community.topic")}
          </label>
          <select id="community-topic" name="topic" value={filters.topic} onChange={updateFilter}>
            <option value="">{t("community.allTopics")}</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {t(`community.topics.${topic}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="community-pathway">
            {t("community.pathway")}
          </label>
          <select id="community-pathway" name="pathway" value={filters.pathway} onChange={updateFilter}>
            <option value="">{t("community.allPathways")}</option>
            {pathways.map((pathway) => (
              <option key={pathway.slug} value={pathway.slug}>
                {pathway.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="community-sort">
            {t("community.sort")}
          </label>
          <select id="community-sort" name="sort" value={filters.sort} onChange={updateFilter}>
            <option value="new">{t("community.sortNew")}</option>
            <option value="helpful">{t("community.sortHelpful")}</option>
            <option value="unanswered">{t("community.sortUnanswered")}</option>
          </select>
        </div>
      </form>

      {status === "error" ? (
        <Notice tone="error">
          <p>{t("community.loadError")}</p>
          <button type="button" className="button" onClick={() => setAttempt((n) => n + 1)}>
            {t("community.retry")}
          </button>
        </Notice>
      ) : (
        <p className="label results-status" role="status">
          {status === "loading" && page === 1
            ? t("community.loading")
            : count === 1
              ? t("community.oneQuestion")
              : t("community.count", { count })}
        </p>
      )}

      {status === "ready" && questions.length === 0 && (
        <div className="community-empty">
          <p>{filters.q ? t("community.emptySearch") : t("community.empty")}</p>
          {!filters.q && (
            <Link className="button button--primary" to={askLink}>
              {t("community.emptyAsk")}
            </Link>
          )}
        </div>
      )}

      <ul className="community-list" aria-busy={status === "loading"}>
        {questions.map((question) => (
          <li key={question.id} className="community-card">
            <h2 className="community-card__title">
              <Link to={`/community/${question.id}`}>{question.title}</Link>
            </h2>
            {question.excerpt && <p className="community-card__excerpt">{question.excerpt}</p>}
            {question.hidden && <p className="community-hidden">{t("community.hiddenNotice")}</p>}
            <p className="community-card__meta">
              <span className="tag">{t(`community.topics.${question.topic}`)}</span>
              {question.pathway && <span className="tag">{question.pathway.name}</span>}
              <Author author={question.author} />
              <span className="community-meta">{t("community.askedOn", { date: formatDate(question.created_at) })}</span>
            </p>
            <p className="community-card__stats">
              <span className={question.answer_count ? "" : "community-meta"}>
                {question.answer_count === 0
                  ? t("community.noAnswers")
                  : question.answer_count === 1
                    ? t("community.oneAnswer")
                    : t("community.answers", { count: question.answer_count })}
              </span>
              {question.has_accepted && <span className="community-accepted">{t("community.accepted")}</span>}
              {question.helpful_count > 0 && (
                <span className="community-meta">
                  {t("community.helpfulCount", { count: question.helpful_count })}
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>

      {hasMore && status !== "loading" && (
        <button type="button" className="button community-more" onClick={() => setPage((n) => n + 1)}>
          {t("community.loadMore")}
        </button>
      )}
    </section>
  );
}
