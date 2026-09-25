import { Link } from "react-router-dom";
import Pictogram from "../components/Pictogram.jsx";
import { AUDIENCES, FEEDBACK_ACTION } from "../getInvolvedContent.js";
import "../about.css";

/**
 * Get involved (/get-involved): the next step for each kind of visitor.
 * Links to this site open in place; links to other sites are ordinary links.
 */
export default function GetInvolved() {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Get involved</p>
        <h1 id="page-title">Your next step</h1>
        <p className="lead">Pick who you are.</p>
      </section>

      {AUDIENCES.map((audience) => (
        <section className="about-section" aria-labelledby={`${audience.id}-title`} key={audience.id}>
          <div className="section-intro">
            <h2 id={`${audience.id}-title`}>{audience.heading}</h2>
            <p className="section-intro__lead">{audience.lead}</p>
          </div>
          <ActionList actions={audience.actions} />
        </section>
      ))}

      <section className="about-section" aria-labelledby="everyone-title">
        <div className="section-intro">
          <h2 id="everyone-title">Everyone</h2>
        </div>
        <ActionList actions={[FEEDBACK_ACTION]} />
      </section>
    </>
  );
}

function ActionList({ actions }) {
  return (
    <ul className="signpost">
      {actions.map((action) => {
        const inner = (
          <>
            <Pictogram name={action.icon} size="small" />
            <span className="signpost__label">{action.label}</span>
            <span className="signpost__detail label">{action.detail}</span>
          </>
        );
        return (
          <li key={action.label}>
            {action.to ? <Link to={action.to}>{inner}</Link> : <a href={action.href}>{inner}</a>}
          </li>
        );
      })}
    </ul>
  );
}
