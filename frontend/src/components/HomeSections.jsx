import { Link } from "react-router-dom";
import parentPhoto from "../assets/audience-parent.jpg";
import studentPhoto from "../assets/audience-student.jpg";
import teacherPhoto from "../assets/audience-teacher.jpg";
import { useT } from "../i18n/I18nProvider.jsx";
import { ArrowIcon, PATHWAY_ICONS } from "./Icons.jsx";

// Homepage sections below the hero (see pages/Home.jsx), in page order.

/* ---------- Audience cards ---------- */

// Photos from Pexels (free to use):
//   audience-teacher.jpg: Antoni Shkraba, https://www.pexels.com/photo/a-female-professor-teaching-her-student-5306457/
//   audience-parent.jpg: cottonbro studio, https://www.pexels.com/photo/a-mother-and-daughter-looking-at-the-paper-6471429/
//   audience-student.jpg: Julia M Cameron, https://www.pexels.com/photo/boy-wearing-yellow-shirt-while-writing-on-white-paper-4144100/
const AUDIENCE_CARDS = [
  { audience: "teacher", photo: teacherPhoto },
  { audience: "parent", photo: parentPhoto },
  { audience: "student", photo: studentPhoto },
];

// The three audience cards. Picking one changes the hero subhead (see Home.jsx).
export function AudienceCards({ selected, onSelect }) {
  const t = useT();
  return (
    <section className="home-section" aria-labelledby="audiences-title">
      <div className="section-intro">
        <p className="label">{t("home.audiences.label")}</p>
        <h2 id="audiences-title">{t("home.audiences.title")}</h2>
        <p className="section-intro__lead">{t("home.audiences.lead")}</p>
      </div>

      <ul className="audience-grid">
        {AUDIENCE_CARDS.map((card) => {
          const isSelected = selected === card.audience;
          return (
            <li
              key={card.audience}
              className={isSelected ? "audience-card audience-card--selected" : "audience-card"}
            >
              {/* Decorative: the text beside it carries the meaning. */}
              <img
                className="audience-card__photo"
                src={card.photo}
                alt=""
                width="720"
                height="1080"
                loading="lazy"
                decoding="async"
              />
              {/* "Selected" text so it isn't shown by colour only */}
              {isSelected && (
                <span className="audience-card__selected" aria-hidden="true">
                  {t("home.audiences.selected")}
                </span>
              )}
              <div className="audience-card__body">
                <p className="label">{t(`home.audiences.${card.audience}.who`)}</p>
                <h3>
                  <button
                    type="button"
                    className="audience-card__button"
                    aria-pressed={isSelected}
                    onClick={() => onSelect(card.audience)}
                  >
                    {t(`home.audiences.${card.audience}.title`)}
                  </button>
                </h3>
                <p>{t(`home.audiences.${card.audience}.text`)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- Pathway tiles ---------- */

// Each tile opens the resources page filtered to that pathway.
export function PathwayTiles() {
  const t = useT();
  return (
    <section className="home-section" aria-labelledby="pathways-title">
      <div className="section-intro">
        <p className="label">{t("home.pathways.label")}</p>
        <h2 id="pathways-title">{t("home.pathways.title")}</h2>
        <p className="section-intro__lead">{t("home.pathways.lead")}</p>
      </div>

      <ul className="pathway-grid">
        {Object.entries(PATHWAY_ICONS).map(([slug, Icon]) => (
          <li key={slug}>
            <Link className="pathway-tile" to={`/resources?pathway=${slug}`}>
              <span className="pathway-tile__icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="pathway-tile__name">{t(`pathways.${slug}`)}</span>
              <span className="pathway-tile__summary">{t(`home.pathways.${slug}`)}</span>
              <ArrowIcon />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- How it works ---------- */

// The four steps. Each one links to the page it talks about.
const STEPS = [
  { key: "browse", link: "/resources" },
  { key: "register", link: "/register-interest" },
  { key: "hearBack", link: "/contact" },
  { key: "getInvolved", link: "/register" },
];

// Four numbered step cards that climb like stairs on desktop (Step 01 lowest) and stack on mobile.
export function HowItWorks() {
  const t = useT();
  return (
    <section className="home-section" aria-labelledby="steps-title">
      <div className="section-intro">
        <p className="label">{t("home.steps.label")}</p>
        <h2 id="steps-title">{t("home.steps.title")}</h2>
      </div>

      <ol className="steps">
        {STEPS.map((step, index) => (
          // --drop: this card's position from the first (0 to 3); the CSS turns it into how high the card sits.
          <li key={step.key} className="step" style={{ "--drop": index }}>
            <p className="label">
              {t("home.steps.step")} <span className="step__number">{String(index + 1).padStart(2, "0")}</span>
            </p>
            <h3 className="step__title">{t(`home.steps.${step.key}.title`)}</h3>
            <p className="step__text">{t(`home.steps.${step.key}.text`)}</p>
            {step.link && (
              <Link className="step__link" to={step.link}>
                {t(`home.steps.${step.key}.link`)}
                <ArrowIcon />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
