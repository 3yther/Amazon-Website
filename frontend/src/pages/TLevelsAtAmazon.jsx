import { Link } from "react-router-dom";
import { IconCards, PageHero, RouteSteps } from "../components/InfoBlocks.jsx";
import {
  BusinessIcon,
  DigitalIcon,
  EngineeringIcon,
  FinanceIcon,
  MediaIcon,
} from "../components/Icons.jsx";
import warehousePhoto from "../assets/pexels-warehouse-operations.jpg";
import { PATHWAYS } from "../aboutContent.js";

// Photo from Pexels, under the Pexels Licence (https://www.pexels.com/license/):
// free to use, attribution not required. Credited here for the asset log.
//   pexels-warehouse-operations.jpg: GB The Green Brand,
//     https://www.pexels.com/photo/modern-warehouse-operations-with-employees-and-forklift-30824313/

import {
  AMAZON_SOURCES,
  GROWTH,
  PLACEMENT_SHAPE,
  ROUTE_IN,
  SUPPORT,
} from "../amazonContent.js";
import "../about.css";
import amazonPhoto from "../assets/amazon-hero.jpg";

// Hero photo from Pexels, under the Pexels Licence (https://www.pexels.com/license/):
// free to use, attribution not required. Credited here for the asset log.
// Saved at 720px wide from Pexels' own image server. Not an Amazon photo, and
// chosen with no visible brands, so it does not claim to show Amazon.
//   amazon-hero.jpg: Mikhail Nilov,
//     https://www.pexels.com/photo/young-professionals-working-with-computers-7988745/

// The same pathway icons as the homepage tiles, so each subject always has
// the same picture wherever it appears.
const PATHWAY_ICONS = {
  digital: DigitalIcon,
  business: BusinessIcon,
  media: MediaIcon,
  finance: FinanceIcon,
  engineering: EngineeringIcon,
};

// The biggest figure sets the full width of the growth bars.
const MOST = Math.max(...GROWTH.map((point) => point.value));

/**
 * T-Levels at Amazon: what the placement is, who looks after you, which
 * pathways Amazon takes, how students get one, and how the programme has
 * grown. Every point has a picture and one line.
 *
 * Takes the pathway list from aboutContent.js so the five pathways are
 * described once on the front end rather than twice.
 */
export default function TLevelsAtAmazon() {
  return (
    <>
      <PageHero
        label="Amazon Emerging Talent"
        title="Nine weeks inside a team."
        lead="Amazon takes T Level students on placement. You join a real team and do real work."
        photo={amazonPhoto}
      />

      <section className="about-section" aria-labelledby="shape-title">
        <div className="section-intro">
          <p className="label">The placement</p>
          <h2 id="shape-title">What the nine weeks look like</h2>
        </div>

        <IconCards items={PLACEMENT_SHAPE} />

        {/* Illustrative stock photography, not a photograph of an Amazon
            site, so it carries an empty alt and no caption that would imply
            otherwise. */}
        <img
          className="about-figure"
          src={warehousePhoto}
          alt=""
          width="900"
          height="600"
          loading="lazy"
          decoding="async"
        />
      </section>

      <section className="about-section" aria-labelledby="support-title">
        <div className="section-intro">
          <p className="label">Support</p>
          <h2 id="support-title">Three people looking after you</h2>
        </div>

        <IconCards items={SUPPORT} />
      </section>

      <section className="about-section" aria-labelledby="pathways-title">
        <div className="section-intro">
          <p className="label">Pathways</p>
          <h2 id="pathways-title">Which subjects Amazon takes</h2>
          <p className="section-intro__lead">
            More on each one on the <Link to="/about">About T-Levels</Link> page.
          </p>
        </div>

        {/* A definition list rather than the tab switcher used on the About
            page: here the point is to compare all five at once. */}
        <dl className="pathway-summary">
          {PATHWAYS.map((pathway) => {
            const PathwayIcon = PATHWAY_ICONS[pathway.slug];
            return (
              <div className="pathway-summary__row" key={pathway.slug}>
                <dt>
                  <span className="pictogram pictogram--small" aria-hidden="true">
                    <PathwayIcon />
                  </span>
                  {pathway.name}
                </dt>
                <dd>
                  {pathway.summary}{" "}
                  {/* Only the pathways Amazon has named publicly carry a status
                      line, so the page never invents a placement. */}
                  {pathway.amazonStatus && (
                    <strong className="pathway-summary__status">{pathway.amazonStatus}</strong>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="about-section" aria-labelledby="route-title">
        <div className="section-intro">
          <p className="label">Getting one</p>
          <h2 id="route-title">How to get a placement</h2>
        </div>

        <RouteSteps steps={ROUTE_IN} />

        <Link className="button button--primary route__action" to="/register-interest">
          Register your interest
        </Link>
      </section>

      <section className="about-section" aria-labelledby="growth-title">
        <div className="section-intro">
          <p className="label">The programme</p>
          <h2 id="growth-title">It is growing</h2>
          <p className="section-intro__lead">Figures from the Department for Education.</p>
        </div>

        <ol className="growth">
          {GROWTH.map((point) => (
            <li className="growth__item" key={point.year}>
              <p className="label">{point.year}</p>
              <p className="growth__value">{point.value}</p>
              <p className="growth__caption">{point.caption}</p>
              {/* The bar shows the number as a length, so the growth can be
                  seen at a glance. The number above already says it in text. */}
              <span className="growth__bar" aria-hidden="true">
                <span style={{ width: `${(point.value / MOST) * 100}%` }} />
              </span>
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
