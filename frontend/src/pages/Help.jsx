import { Link } from "react-router-dom";
import { IconCards, PageHero } from "../components/InfoBlocks.jsx";
import Pictogram from "../components/Pictogram.jsx";
import { useSiteContent } from "../i18n/content.js";
import { useT } from "../i18n/I18nProvider.jsx";
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
  const t = useT();
  // helpContent.js, in the visitor's language.
  const { PROVIDER_QUESTIONS, SERVICES, SITE_ROUTES } = useSiteContent().help;

  return (
    <>
      <PageHero label={t("help.hero.label")} title={t("help.hero.title")} lead={t("help.hero.lead")} photo={helpPhoto} />

      <section className="about-section" aria-labelledby="site-title">
        <div className="section-intro">
          <p className="label">{t("help.site.label")}</p>
          <h2 id="site-title">{t("help.site.title")}</h2>
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
          <p className="label">{t("help.services.label")}</p>
          <h2 id="services-title">{t("help.services.title")}</h2>
          <p className="section-intro__lead">{t("help.services.lead")}</p>
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
          <p className="label">{t("help.questions.label")}</p>
          <h2 id="questions-title">{t("help.questions.title")}</h2>
        </div>

        <ul className="audience">
          {PROVIDER_QUESTIONS.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="stuck-title">
        <div className="section-intro">
          <p className="label">{t("help.person.label")}</p>
          <h2 id="stuck-title">{t("help.person.title")}</h2>
        </div>

        <div className="help-person">
          <Pictogram name="phone" />
          <p>
            {t("help.person.text")} <a href="tel:0800100900">0800 100 900</a>.
          </p>
        </div>
      </section>
    </>
  );
}
