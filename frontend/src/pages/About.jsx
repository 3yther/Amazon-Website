import AboutFaq from "../components/AboutFaq.jsx";
import PathwaySwitcher from "../components/PathwaySwitcher.jsx";
import TLevelQuiz from "../components/TLevelQuiz.jsx";
import {
  AMAZON_PROGRAMME,
  AUDIENCE_POINTS,
  BENEFITS,
  COST_POINTS,
  GRADES,
  PLACEMENT_FACTS,
  ROUTE_STEPS,
  SOURCES,
} from "../aboutContent.js";
import "../about.css";

/**
 * About T-Level: what a T Level is, how the industry placement works, the five
 * pathways Amazon offers and what its programme looks like, how the grading
 * and UCAS points work, who it suits, what you get out of it and what it
 * costs, plus three interactive parts (pathway tabs, a quiz and an FAQ).
 *
 * The wording lives in aboutContent.js and the styles in about.css, both of
 * which belong to this page only, so nobody else's files are touched. Every
 * figure is sourced, and the sources are listed at the foot of the page.
 */
export default function About() {
  return (
    <>
      <section className="about-hero" aria-labelledby="page-title">
        <p className="label">About T-Levels</p>
        <h1 id="page-title">Two years. One industry. A real placement.</h1>
        <p className="about-hero__lead">
          A T Level is a technical qualification you take after your GCSEs, broadly the same size as
          three A levels. You spend most of it learning your subject and the rest of it working.
        </p>
      </section>

      <section className="about-section" aria-labelledby="what-title">
        <div className="section-intro">
          <p className="label">How it works</p>
          <h2 id="what-title">What a T Level actually is</h2>
          <p className="section-intro__lead">
            One course, two years, built with the employers who hire at the end of it.
          </p>
        </div>

        <ol className="route">
          {ROUTE_STEPS.map((step) => (
            <li className="route__step" key={step.number}>
              {/* The number is decoration on top of the ordered list, so it is
                  hidden from screen readers to avoid "01 one" being read out. */}
              <span className="route__number" aria-hidden="true">
                {step.number}
              </span>
              <div>
                <h3 className="route__title">{step.title}</h3>
                <p className="route__text">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-section" aria-labelledby="placement-title">
        <div className="section-intro">
          <p className="label">The placement</p>
          <h2 id="placement-title">Inside the industry placement</h2>
          <p className="section-intro__lead">
            The rules come from the Department for Education, not from the employer.
          </p>
        </div>

        <ul className="info-grid">
          {PLACEMENT_FACTS.map((fact) => (
            <li className="info-card" key={fact.title}>
              <h3>{fact.title}</h3>
              <p>{fact.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Tabbed switcher for the five pathways. */}
      <PathwaySwitcher />

      <section className="about-section" aria-labelledby="amazon-title">
        <div className="section-intro">
          <p className="label">At Amazon</p>
          <h2 id="amazon-title">What an Amazon placement looks like</h2>
          <p className="section-intro__lead">
            Taken from Amazon&apos;s own placement pages and its case study with the Department for
            Education.
          </p>
        </div>

        <ul className="info-grid">
          {AMAZON_PROGRAMME.map((item) => (
            <li className="info-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="grades-title">
        <div className="section-intro">
          <p className="label">Grades</p>
          <h2 id="grades-title">How it is graded, and what it is worth</h2>
          <p className="section-intro__lead">
            Your certificate shows two grades: the core, marked A star to E, and your occupational
            specialism, marked pass, merit or distinction. Those combine into one overall grade.
          </p>
        </div>

        {/* A real table, because this is tabular data. The caption names it for
            screen readers, and scope tells them which heading owns each cell. */}
        {/* NEW CONCEPT: a container that can scroll must be reachable by
            keyboard, so it takes tabIndex 0. Anything focusable needs an
            accessible name, which is why it is also a labelled region. Its name
            differs from the section's, so the two landmarks are not confused. */}
        <div
          className="grades__scroll"
          tabIndex={0}
          role="region"
          aria-label="Grades and UCAS points table"
        >
          <table className="grades">
            <caption className="sr-only">
              T Level overall grades and the UCAS Tariff points each one is worth
            </caption>
            <thead>
              <tr>
                <th scope="col">Overall grade</th>
                <th scope="col">UCAS points</th>
              </tr>
            </thead>
            <tbody>
              {GRADES.map((row) => (
                <tr key={row.grade}>
                  <th scope="row">{row.grade}</th>
                  <td>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="grades__note">
          Not every university uses UCAS points, so check the entry requirements of the course you
          want. If you do not pass every part of the T Level you get a statement of achievement
          listing what you did complete.
        </p>
      </section>

      <section className="about-section" aria-labelledby="who-title">
        <div className="section-intro">
          <p className="label">Who it is for</p>
          <h2 id="who-title">A T Level may suit you if</h2>
        </div>

        <ul className="audience">
          {AUDIENCE_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="why-title">
        <div className="section-intro">
          <p className="label">Why do one</p>
          <h2 id="why-title">What you get out of it</h2>
        </div>

        <ul className="info-grid">
          {BENEFITS.map((benefit) => (
            <li className="info-card" key={benefit.title}>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="cost-title">
        <div className="section-intro">
          <p className="label">Money</p>
          <h2 id="cost-title">What it costs</h2>
        </div>

        <ul className="audience">
          {COST_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      {/* Six question quiz, scored in the browser. Nothing is sent anywhere. */}
      <TLevelQuiz />

      {/* Expandable FAQ. */}
      <AboutFaq />

      <section className="about-sources" aria-labelledby="sources-title">
        <h2 id="sources-title" className="label">
          Sources
        </h2>
        <p>
          Every figure on this page was checked against these in September 2026. Entry requirements
          are set by each school or college, so always check with the provider.
        </p>
        <ol>
          {SOURCES.map((source) => (
            <li key={source.url}>
              <a href={source.url}>{source.title}</a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
