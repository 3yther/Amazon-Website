import { Link } from "react-router-dom";
import AboutFaq from "../components/AboutFaq.jsx";
import { IconCards, IconList, PageHero, RouteSteps, ShareBar } from "../components/InfoBlocks.jsx";
import PathwaySwitcher from "../components/PathwaySwitcher.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import TLevelQuiz from "../components/TLevelQuiz.jsx";
import { useSiteContent } from "../i18n/content.js";
import { useT } from "../i18n/I18nProvider.jsx";
import "../about.css";
import aboutPhoto from "../assets/about-hero.jpg";

// Hero photo from Pexels, under the Pexels Licence (https://www.pexels.com/license/):
// free to use, attribution not required. Credited here for the asset log.
// Saved at 720px wide from Pexels' own image server.
//   about-hero.jpg: ThisIsEngineering,
//     https://www.pexels.com/photo/engineers-in-workshop-3861960/

/**
 * About T-Level: what a T-Level is, how the placement works, the five
 * pathways, grades, who it suits, why do one and what it costs, plus the
 * pathway tabs, a quiz and an FAQ.
 *
 * Kept short on purpose: every point has a picture and one line, so the page
 * can be followed by someone who finds long text hard. The wording lives in
 * aboutContent.js (and its translations, see i18n/content.js), the page's own
 * headings in i18n/messages under "about", and every figure is sourced at the
 * foot of the page.
 */
export default function About() {
  const t = useT();
  const { AUDIENCE_POINTS, BENEFITS, COST_POINTS, GRADES, PLACEMENT_FACTS, ROUTE_STEPS, SOURCES, TIME_SPLIT } =
    useSiteContent().about;

  return (
    <>
      <PageHero label={t("about.hero.label")} title={t("about.hero.title")} lead={t("about.hero.lead")} photo={aboutPhoto} />

      <section className="about-section" aria-labelledby="what-title">
        <div className="section-intro">
          <p className="label">{t("about.what.label")}</p>
          <h2 id="what-title">{t("about.what.title")}</h2>
        </div>

        <RouteSteps steps={ROUTE_STEPS} />
        <ShareBar parts={TIME_SPLIT} label={t("about.what.split")} />
      </section>

      <section className="about-section" aria-labelledby="placement-title">
        <div className="section-intro">
          <p className="label">{t("about.placement.label")}</p>
          <h2 id="placement-title">{t("about.placement.title")}</h2>
        </div>

        <IconCards items={PLACEMENT_FACTS} />

        <ul className="signpost signpost--single">
          <li>
            <Link to="/t-levels-at-amazon">
              <span className="signpost__label">{t("about.placement.amazonLink")}</span>
              <span className="signpost__detail label">{t("about.placement.amazonDetail")}</span>
            </Link>
          </li>
        </ul>
      </section>

      {/* Tabbed switcher for the five pathways. */}
      <PathwaySwitcher />

      <PhotoStrip />

      <section className="about-section" aria-labelledby="grades-title">
        <div className="section-intro">
          <p className="label">{t("about.grades.label")}</p>
          <h2 id="grades-title">{t("about.grades.title")}</h2>
          <p className="section-intro__lead">{t("about.grades.lead")}</p>
        </div>

        {/* A real table, because this is tabular data. The caption names it for
            screen readers, and scope tells them which heading owns each cell. */}
        {/* NEW CONCEPT: a container that can scroll must be reachable by
            keyboard, so it takes tabIndex 0. Anything focusable needs an
            accessible name, which is why it is also a labelled region. Its name
            differs from the section's, so the two landmarks are not confused. */}
        <div className="grades__scroll" tabIndex={0} role="region" aria-label={t("about.grades.tableName")}>
          <table className="grades">
            <caption className="sr-only">{t("about.grades.caption")}</caption>
            <thead>
              <tr>
                <th scope="col">{t("about.grades.grade")}</th>
                <th scope="col">{t("about.grades.points")}</th>
              </tr>
            </thead>
            <tbody>
              {GRADES.map((row) => (
                <tr key={row.points}>
                  <th scope="row">{row.grade}</th>
                  <td>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="grades__note">{t("about.grades.note")}</p>
      </section>

      <section className="about-section" aria-labelledby="who-title">
        <div className="section-intro">
          <p className="label">{t("about.who.label")}</p>
          <h2 id="who-title">{t("about.who.title")}</h2>
        </div>

        <IconList items={AUDIENCE_POINTS} />
      </section>

      <section className="about-section" aria-labelledby="why-title">
        <div className="section-intro">
          <p className="label">{t("about.why.label")}</p>
          <h2 id="why-title">{t("about.why.title")}</h2>
        </div>

        <IconCards items={BENEFITS} />
      </section>

      <section className="about-section" aria-labelledby="cost-title">
        <div className="section-intro">
          <p className="label">{t("about.cost.label")}</p>
          <h2 id="cost-title">{t("about.cost.title")}</h2>
        </div>

        <IconCards items={COST_POINTS} />
      </section>

      {/* Six question quiz, scored in the browser. Nothing is sent anywhere. */}
      <TLevelQuiz />

      {/* Expandable FAQ. */}
      <AboutFaq />

      {/* Sources stay in English: they are the official titles of the
          documents, which is how a marker or a parent would search for them. */}
      <section className="about-sources" aria-labelledby="sources-title">
        <h2 id="sources-title" className="label">
          {t("about.sources.title")}
        </h2>
        <p>{t("about.sources.note")}</p>
        <ol>
          {SOURCES.map((source) => (
            <li key={source.url}>
              <a href={source.url} lang="en-GB">
                {source.title}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
