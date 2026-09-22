import { Link } from "react-router-dom";
import { PATHWAYS } from "../aboutContent.js";
import {
  AMAZON_SOURCES,
  GROWTH,
  PLACEMENT_SHAPE,
  ROUTE_IN,
  SUPPORT,
} from "../amazonContent.js";
import "../about.css";

/**
 * T-Levels at Amazon: what Amazon's placement programme is, the support around
 * it, which pathways it covers, how a student ends up on one, and how the
 * programme has grown.
 *
 * Shares about.css with the other information pages, and takes the pathway
 * list from aboutContent.js so the five pathways are described once on the
 * front end rather than twice.
 */
export default function TLevelsAtAmazon() {
  return (
    <>
      <section className="about-hero" aria-labelledby="page-title">
        <p className="label">Amazon Emerging Talent</p>
        <h1 id="page-title">Nine weeks inside a team.</h1>
        <p className="about-hero__lead">
          Amazon hosts T Level students for their industry placement. Not shadowing, not a tour.
          You join a team, learn the tools and do work the team needs doing.
        </p>
      </section>

      <section className="about-section" aria-labelledby="shape-title">
        <div className="section-intro">
          <p className="label">The placement</p>
          <h2 id="shape-title">What the nine weeks look like</h2>
        </div>

        <ul className="info-grid">
          {PLACEMENT_SHAPE.map((item) => (
            <li className="info-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="support-title">
        <div className="section-intro">
          <p className="label">Support</p>
          <h2 id="support-title">Three people looking after you</h2>
          <p className="section-intro__lead">
            Nobody is dropped in and left. Every student gets all three.
          </p>
        </div>

        <ul className="info-grid">
          {SUPPORT.map((item) => (
            <li className="info-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="pathways-title">
        <div className="section-intro">
          <p className="label">Pathways</p>
          <h2 id="pathways-title">Which subjects Amazon takes</h2>
          <p className="section-intro__lead">
            Amazon started with Digital and has said it is widening the programme. Full detail of
            each pathway is on the <Link to="/about">About T-Levels</Link> page.
          </p>
        </div>

        {/* A definition list rather than the tab switcher used on the About
            page: here the point is to compare all five at once. */}
        <dl className="pathway-summary">
          {PATHWAYS.map((pathway) => (
            <div className="pathway-summary__row" key={pathway.slug}>
              <dt>{pathway.name}</dt>
              <dd>
                {pathway.summary}{" "}
                {/* Only the pathways Amazon has named publicly carry a status
                    line, so the page never invents a placement. */}
                {pathway.amazonStatus && (
                  <strong className="pathway-summary__status">{pathway.amazonStatus}</strong>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="about-section" aria-labelledby="route-title">
        <div className="section-intro">
          <p className="label">Getting one</p>
          <h2 id="route-title">How students end up on a placement</h2>
        </div>

        <ol className="route">
          {ROUTE_IN.map((step) => (
            <li className="route__step" key={step.number}>
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

        <Link className="button button--primary route__action" to="/register">
          Register your interest
        </Link>
      </section>

      <section className="about-section" aria-labelledby="growth-title">
        <div className="section-intro">
          <p className="label">The programme</p>
          <h2 id="growth-title">It is growing</h2>
          <p className="section-intro__lead">
            Figures reported by the Department for Education. Each one is tied to its year.
          </p>
        </div>

        <ol className="growth">
          {GROWTH.map((point) => (
            <li className="growth__item" key={point.year}>
              <p className="label">{point.year}</p>
              <p className="growth__value">{point.value}</p>
              <p className="growth__caption">{point.caption}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-sources" aria-labelledby="sources-title">
        <h2 id="sources-title" className="label">
          Sources
        </h2>
        <p>Checked in September 2026.</p>
        <ol>
          {AMAZON_SOURCES.map((source) => (
            <li key={source.url}>
              <a href={source.url}>{source.title}</a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
