import { Link } from "react-router-dom";
import { PROVIDER_QUESTIONS, SERVICES, SITE_ROUTES } from "../helpContent.js";
import "../about.css";

/**
 * Help: where to go next, by what the person is trying to do. Everything here
 * links to a page that exists on this site or to a real national service. No
 * invented contact details, and nothing promising a feature we have not built.
 */
export default function Help() {
  return (
    <>
      <section className="about-hero" aria-labelledby="page-title">
        <p className="label">Help</p>
        <h1 id="page-title">Stuck? Start here.</h1>
        <p className="about-hero__lead">
          What you need depends on what you are trying to do. Pick the closest one.
        </p>
      </section>

      <section className="about-section" aria-labelledby="site-title">
        <div className="section-intro">
          <p className="label">On this site</p>
          <h2 id="site-title">Where to go</h2>
        </div>

        <ul className="signpost">
          {SITE_ROUTES.map((route) => (
            <li key={route.to}>
              <Link to={route.to}>
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
          <h2 id="services-title">Free services worth knowing about</h2>
          <p className="section-intro__lead">
            These are run by the government, not by us, and they are all free.
          </p>
        </div>

        <ul className="info-grid">
          {SERVICES.map((service) => (
            <li className="info-card" key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <p>
                <a href={service.href}>{service.linkText}</a>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="questions-title">
        <div className="section-intro">
          <p className="label">Before you choose</p>
          <h2 id="questions-title">Questions to ask a school or college</h2>
          <p className="section-intro__lead">
            Two providers running the same T Level can feel very different. These are the questions
            that show you which.
          </p>
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
          <p className="section-intro__lead">
            Your teacher or careers adviser knows your situation and the providers near you, which
            no website does. If you would rather ask someone outside school, the National Careers
            Service is free on 0800 100 900 and open to anyone aged 13 and over.
          </p>
        </div>
      </section>
    </>
  );
}
