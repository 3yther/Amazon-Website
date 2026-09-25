import { Link } from "react-router-dom";
import Pictogram from "../components/Pictogram.jsx";
import { AUDIENCES, FEEDBACK_ACTION } from "../getInvolvedContent.js";
import { useT } from "../i18n/I18nProvider.jsx";
import "../about.css";

// Get involved page: the next step for each type of visitor.
export default function GetInvolved() {
  const t = useT();
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("getInvolvedPage.label")}</p>
        <h1 id="page-title">{t("getInvolvedPage.title")}</h1>
        <p className="lead">{t("getInvolvedPage.lead")}</p>
      </section>

      {AUDIENCES.map((audience) => (
        <section className="about-section" aria-labelledby={`${audience.id}-title`} key={audience.id}>
          <div className="section-intro">
            <h2 id={`${audience.id}-title`}>{t(`getInvolvedPage.audiences.${audience.id}.heading`)}</h2>
            <p className="section-intro__lead">{t(`getInvolvedPage.audiences.${audience.id}.lead`)}</p>
          </div>
          <ActionList actions={audience.actions} />
        </section>
      ))}

      <section className="about-section" aria-labelledby="everyone-title">
        <div className="section-intro">
          <h2 id="everyone-title">{t("getInvolvedPage.everyone")}</h2>
        </div>
        <ActionList actions={[FEEDBACK_ACTION]} />
      </section>
    </>
  );
}

function ActionList({ actions }) {
  const t = useT();
  return (
    <ul className="signpost">
      {actions.map((action) => {
        const inner = (
          <>
            <Pictogram name={action.icon} size="small" />
            <span className="signpost__label">{t(`getInvolvedPage.actions.${action.id}.label`)}</span>
            <span className="signpost__detail label">{t(`getInvolvedPage.actions.${action.id}.detail`)}</span>
          </>
        );
        return (
          <li key={action.id}>
            {action.to ? <Link to={action.to}>{inner}</Link> : <a href={action.href}>{inner}</a>}
          </li>
        );
      })}
    </ul>
  );
}
