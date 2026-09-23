import { Link } from "react-router-dom";
import AboutFaq from "../components/AboutFaq.jsx";
import { IconCards, IconList, PageHero, RouteSteps, ShareBar } from "../components/InfoBlocks.jsx";
import PathwaySwitcher from "../components/PathwaySwitcher.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import TLevelQuiz from "../components/TLevelQuiz.jsx";
import {
  AUDIENCE_POINTS,
  BENEFITS,
  COST_POINTS,
  GRADES,
  PLACEMENT_FACTS,
  ROUTE_STEPS,
  SOURCES,
  TIME_SPLIT,
} from "../aboutContent.js";
import "../about.css";
import aboutPhoto from "../assets/about-hero.jpg";

// Hero photo from Pexels, under the Pexels Licence (https://www.pexels.com/license/):
// free to use, attribution not required. Credited here for the asset log.
// Saved at 720px wide from Pexels' own image server.
//   about-hero.jpg: ThisIsEngineering,
//     https://www.pexels.com/photo/engineers-in-workshop-3861960/

/**
 * About T-Level: what a T Level is, how the placement works, the five
 * pathways, grades, who it suits, why do one and what it costs, plus the
 * pathway tabs, a quiz and an FAQ.
 *
 * Kept short on purpose: every point has a picture and one line, so the page
 * can be followed by someone who finds long text hard. The wording lives in
 * aboutContent.js, and every figure is sourced at the foot of the page.
 */
export default function About() {
  return (
    <>
      <PageHero
        label="About T-Levels"
        title="Two years. One industry. A real placement."
        lead="A technical qualification you take after your GCSEs. Mostly learning, part working."
        photo={aboutPhoto}
      />

      <section className="about-section" aria-labelledby="what-title">
        <div className="section-intro">
          <p className="label">How it works</p>
          <h2 id="what-title">What a T Level is</h2>
        </div>

        <RouteSteps steps={ROUTE_STEPS} />
        <ShareBar parts={TIME_SPLIT} label="How the two years are split" />
      </section>

      <section className="about-section" aria-labelledby="placement-title">
        <div className="section-intro">
          <p className="label">The placement</p>
          <h2 id="placement-title">Inside the placement</h2>
        </div>

        <IconCards items={PLACEMENT_FACTS} />

        <ul className="signpost signpost--single">
          <li>
            <Link to="/t-levels-at-amazon">
              <span className="signpost__label">What a placement at Amazon looks like</span>
              <span className="signpost__detail label">T-Levels at Amazon</span>
            </Link>
          </li>
        </ul>
      </section>

      {/* Tabbed switcher for the five pathways. */}
      <PathwaySwitcher />

      <PhotoStrip />

      <section className="about-section" aria-labelledby="grades-title">
        <div className="section-intro">
          <p className="label">Grades</p>
          <h2 id="grades-title">Grades and UCAS points</h2>
          <p className="section-intro__lead">
            Your grade earns UCAS points, which count towards university.
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
          Not every university uses UCAS points, so check your course. Miss a part and you still get
          a statement of what you passed.
        </p>
      </section>

      <section className="about-section" aria-labelledby="who-title">
        <div className="section-intro">
          <p className="label">Who it is for</p>
          <h2 id="who-title">It may suit you if</h2>
        </div>

        <IconList items={AUDIENCE_POINTS} />
      </section>

      <section className="about-section" aria-labelledby="why-title">
        <div className="section-intro">
          <p className="label">Why do one</p>
          <h2 id="why-title">What you get</h2>
        </div>

        <IconCards items={BENEFITS} />
      </section>

      <section className="about-section" aria-labelledby="cost-title">
        <div className="section-intro">
          <p className="label">Money</p>
          <h2 id="cost-title">What it costs</h2>
        </div>

        <IconCards items={COST_POINTS} />
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
          Checked in September 2026. Entry requirements are set by each school or college, so check
          with yours.
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
