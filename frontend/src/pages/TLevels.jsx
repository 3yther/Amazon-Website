import { Link } from "react-router-dom";
import { ArrowIcon } from "../components/Icons.jsx";
import { PATHWAYS } from "../aboutContent.js";
import { T_LEVEL_ROUTES, T_LEVEL_SUBJECTS, subjectPage } from "../tlevelSubjects.js";
import "../about.css";

const PATHWAY_NAMES = Object.fromEntries(PATHWAYS.map((pathway) => [pathway.slug, pathway.name]));
const RUNNING_ROUTES = T_LEVEL_ROUTES.filter((route) =>
  route.subjects.some((subject) => !subject.comingIn),
);

/**
 * All T-Levels (/t-levels): every subject, not just the five pathways this
 * site focuses on, grouped into gov.uk's routes. Each subject links to its
 * official page, so the detail stays with the people who keep it current.
 */
export default function TLevels() {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Subjects</p>
        <h1 id="page-title">All T-Levels</h1>
        <p className="lead">
          {T_LEVEL_SUBJECTS.length} subjects across {RUNNING_ROUTES.length} routes, from agriculture to
          marketing. Two more arrive in September 2028.
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
                      <span className="sr-only">, on tlevels.gov.uk</span>
                    </a>
                  ) : (
                    <span>{subject.name}</span>
                  )}
                  {(subject.note || subject.comingIn) && (
                    <span className="t-level-routes__note">
                      {subject.note ?? `Coming ${subject.comingIn}`}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {route.pathway && (
              <Link className="card__action t-level-routes__pathway" to={`/resources?pathway=${route.pathway}`}>
                {PATHWAY_NAMES[route.pathway]} resources
                <ArrowIcon />
              </Link>
            )}
          </li>
        ))}
      </ul>

      <section className="about-section" aria-labelledby="next-title">
        <div className="section-intro">
          <p className="label">Next</p>
          <h2 id="next-title">Find one near you</h2>
          <p className="section-intro__lead">
            Not every school or college runs every subject.
          </p>
        </div>
        <ul className="signpost">
          <li>
            <Link to="/t-level-near-you">
              <span className="signpost__label">Search by postcode on this site</span>
              <span className="signpost__detail label">T-Level Near You</span>
            </Link>
          </li>
          <li>
            <a href="https://www.tlevels.gov.uk/students/find">
              <span className="signpost__label">Search every provider in England</span>
              <span className="signpost__detail label">tlevels.gov.uk</span>
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}
