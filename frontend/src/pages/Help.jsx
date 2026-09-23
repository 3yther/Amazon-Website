import { Link } from "react-router-dom";
import { IconCards, PageHero } from "../components/InfoBlocks.jsx";
import Pictogram from "../components/Pictogram.jsx";
import { PROVIDER_QUESTIONS, SERVICES, SITE_ROUTES } from "../helpContent.js";
import "../about.css";
import helpPhoto from "../assets/help-hero.jpg";

// Hero photo from Pexels, under the Pexels Licence (https://www.pexels.com/license/):
// free to use, attribution not required. Credited here for the asset log.
// Saved at 720px wide from Pexels' own image server.
//   help-hero.jpg: RDNE Stock project,
//     https://www.pexels.com/photo/a-teacher-talking-to-his-student-8419636/

/**
 * Help: where to go next, by what the person is trying to do. Everything here
 * links to a page that exists on this site or to a real national service. No
 * invented contact details, and nothing promising a feature we have not built.
 */
export default function Help() {
  return (
    <>
      <PageHero
        label="Help"
        title="Stuck? Start here."
        lead="Pick what you are trying to do."
        photo={helpPhoto}
      />

      <section className="about-section" aria-labelledby="site-title">
        <div className="section-intro">
          <p className="label">On this site</p>
          <h2 id="site-title">Where to go</h2>
        </div>

        <ul className="signpost">
          {SITE_ROUTES.map((route) => (
            <li key={route.to}>
              <Link to={route.to}>
                <Pictogram name={route.icon} size="small" />
                <span className="signpost__label">{route.label}</span>
                <span className="signpost__detail label">{route.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="services-title">
        <div className="section-intro">
          <p className="label">Elsewhere</p>
          <h2 id="services-title">Free services</h2>
          <p className="section-intro__lead">Run by the government, not by us.</p>
        </div>

        <IconCards items={SERVICES}>
          {(service) => (
            <p>
              <a href={service.href}>{service.linkText}</a>
            </p>
          )}
        </IconCards>
      </section>

      <section className="about-section" aria-labelledby="questions-title">
        <div className="section-intro">
          <p className="label">Before you choose</p>
          <h2 id="questions-title">Ask your school or college</h2>
        </div>

        <ul className="audience">
          {PROVIDER_QUESTIONS.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="stuck-title">
        <div className="section-intro">
          <p className="label">Still stuck</p>
          <h2 id="stuck-title">Ask a person</h2>
        </div>

        <div className="help-person">
          <Pictogram name="phone" />
          <p>
            Talk to your teacher or careers adviser. Or call the National Careers Service free on{" "}
            <a href="tel:0800100900">0800 100 900</a>.
          </p>
        </div>
      </section>
    </>
  );
}
