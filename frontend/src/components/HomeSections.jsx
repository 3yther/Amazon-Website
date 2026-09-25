import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import parentPhoto from "../assets/audience-parent.jpg";
import studentPhoto from "../assets/audience-student.jpg";
import teacherPhoto from "../assets/audience-teacher.jpg";
import { AUDIENCES, CONTENT_TYPES, PATHWAY_NAMES } from "../labels.js";
import { T_LEVEL_SUBJECTS } from "../tlevelSubjects.js";
import { useT } from "../i18n/I18nProvider.jsx";
import { useReducedMotion } from "../useReducedMotion.js";
import {
  ArrowIcon,
  BusinessIcon,
  DigitalIcon,
  EngineeringIcon,
  FinanceIcon,
  MediaIcon,
} from "./Icons.jsx";

// Homepage sections below the hero (see pages/Home.jsx), in page order.

/* ---------- Stats ---------- */

// Counted from the project's own data, so the numbers stay accurate.
// Labels are translation keys (i18n/messages, home.stats).
const STATS = [
  { value: T_LEVEL_SUBJECTS.length, label: "home.stats.tLevels" },
  { value: PATHWAY_NAMES.length, label: "home.stats.pathways" },
  { value: Object.keys(CONTENT_TYPES).length, label: "home.stats.resourceTypes" },
  { value: Object.keys(AUDIENCES).filter((key) => key !== "all").length, label: "home.stats.audiences" },
];

const COUNT_UP_MS = 1200;

// Goes from 0 to 1 once the stats scroll into view. Straight to 1 with reduced motion.
function useCountUp(ref) {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      setProgress(1);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect(); // once only
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / COUNT_UP_MS, 1);
          setProgress(t);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref, reducedMotion]);

  return progress;
}

export function StatsRow() {
  const t = useT();
  const list = useRef(null);
  const progress = useCountUp(list);
  const eased = 1 - (1 - progress) ** 3; // fast start, gentle landing

  return (
    <section className="stats" aria-labelledby="stats-title">
      <h2 id="stats-title" className="sr-only">
        {t("home.stats.title")}
      </h2>
      <ul ref={list} className="stats__list">
        {STATS.map((stat) => (
          <li key={stat.label} className="stats__item">
            {/* Seen: the counting number over its label. Heard: the final
                value and label as one phrase, never the steps on the way up. */}
            <span className="stats__value" aria-hidden="true">
              {Math.round(stat.value * eased)}
            </span>
            <span className="label" aria-hidden="true">
              {t(stat.label)}
            </span>
            <span className="sr-only">{`${stat.value} ${t(stat.label)}`}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

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
const PATHWAYS = [
  { slug: "digital", Icon: DigitalIcon },
  { slug: "business", Icon: BusinessIcon },
  { slug: "media", Icon: MediaIcon },
  { slug: "finance", Icon: FinanceIcon },
  { slug: "engineering", Icon: EngineeringIcon },
];

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
        {PATHWAYS.map(({ slug, Icon }) => (
          <li key={slug}>
            <Link className="pathway-tile" to={`/resources?pathway=${slug}`}>
              <Icon />
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

// The four steps. "Hear back" has no link because there's nowhere to go.
const STEPS = [
  { key: "browse", link: "/resources" },
  { key: "register", link: "/register-interest" },
  { key: "hearBack" },
  { key: "getInvolved", link: "/register" },
];

// Four "Level" cards that step down like stairs on desktop and stack on mobile.
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
          // --drop: how many steps below the top card this one starts.
          <li key={step.key} className="step" style={{ "--drop": index }}>
            <p className="label">
              {t("home.steps.level")} <span className="step__number">{String(index + 1).padStart(2, "0")}</span>
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
