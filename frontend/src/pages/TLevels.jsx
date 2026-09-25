import { Link } from "react-router-dom";
import { ArrowIcon } from "../components/Icons.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import { T_LEVEL_ROUTES, T_LEVEL_SUBJECTS, subjectPage } from "../tlevelSubjects.js";
import "../about.css";

const RUNNING_ROUTES = T_LEVEL_ROUTES.filter((route) =>
  route.subjects.some((subject) => !subject.comingIn),
);

// All T-Levels page: every subject grouped by route, linking to the official pages.
// The route and subject names are the official ones, so they stay in English.
export default function TLevels() {
  const t = useT();
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("tLevelsPage.label")}</p>
        <h1 id="page-title">{t("tLevelsPage.title")}</h1>
        <p className="lead">
          {t("tLevelsPage.lead", { subjects: T_LEVEL_SUBJECTS.length, routes: RUNNING_ROUTES.length })}
        </p>
      </section>

      <ul className="card-grid t-level-routes">
        {T_LEVEL_ROUTES.map((route) => (
          <li className="card" key={route.name}>
            <h2 className="card__title">{route.name}</h2>

            <ul className="t-level-routes__subjects">
              {route.subjects.map((subject) => (
                <li key={subject.name}>
                  {subject.page ? (
                    <a href={subjectPage(subject)}>
                      {subject.name}
                      <span className="sr-only">{t("tLevelsPage.onGovUk")}</span>
                    </a>
                  ) : (
                    <span>{subject.name}</span>
                  )}
                  {subject.note && (
                    <span className="t-level-routes__note">{t(`tLevelsPage.notes.${subject.note}`)}</span>
                  )}
                  {subject.comingIn && (
                    <span className="t-level-routes__note">
                      {t("tLevelsPage.comingIn", { year: subject.comingIn })}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {route.pathway && (
              <Link className="card__action t-level-routes__pathway" to={`/resources?pathway=${route.pathway}`}>
                {t("tLevelsPage.pathwayResources", { pathway: t(`pathways.${route.pathway}`) })}
                <ArrowIcon />
              </Link>
            )}
          </li>
        ))}
      </ul>

      <section className="about-section" aria-labelledby="next-title">
        <div className="section-intro">
          <p className="label">{t("tLevelsPage.nextLabel")}</p>
          <h2 id="next-title">{t("tLevelsPage.nextTitle")}</h2>
          <p className="section-intro__lead">{t("tLevelsPage.nextLead")}</p>
        </div>
        <ul className="signpost">
          <li>
            <Link to="/t-level-near-you">
              <span className="signpost__label">{t("tLevelsPage.searchHere")}</span>
              <span className="signpost__detail label">{t("nearYou.title")}</span>
            </Link>
          </li>
          <li>
            <a href="https://www.tlevels.gov.uk/students/find">
              <span className="signpost__label">{t("tLevelsPage.searchEngland")}</span>
              <span className="signpost__detail label">tlevels.gov.uk</span>
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}
