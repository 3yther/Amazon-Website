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

/**
 * 0 to 1 over COUNT_UP_MS, starting the first time the element is at least
 * half in view. It runs once only, so scrolling away and back leaves the
 * numbers alone. With reduced motion, or no IntersectionObserver, it is 1
 * straight away.
 */
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

// Photos from Pexels, under the Pexels Licence (https://www.pexels.com/license/):
// free to use, attribution not required. Credited here for the asset log.
// Saved at 720px wide from Pexels' own image server.
//   audience-teacher.jpg: Antoni Shkraba,
//     https://www.pexels.com/photo/a-female-professor-teaching-her-student-5306457/
//   audience-parent.jpg: cottonbro studio,
//     https://www.pexels.com/photo/a-mother-and-daughter-looking-at-the-paper-6471429/
//   audience-student.jpg: Julia M Cameron,
//     https://www.pexels.com/photo/boy-wearing-yellow-shirt-while-writing-on-white-paper-4144100/
// Each card's words are home.audiences.<audience> in i18n/messages.
const AUDIENCE_CARDS = [
  { audience: "teacher", photo: teacherPhoto },
  { audience: "parent", photo: parentPhoto },
  { audience: "student", photo: studentPhoto },
];

/**
 * The three audience cards double as the audience choice for the hero
 * subhead (see Home.jsx). Each card's headline is a real toggle button,
 * inside the h3 so the heading stays a heading, and its click area is
 * stretched over the whole card in styles.css.
 */
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
              {/* A visible "Selected" as well as the orange border, so the
                  choice never rests on colour alone. Screen readers get the
                  button's pressed state instead. */}
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

// Slugs match backend/content/fixtures/pathways.json. Names and summaries
// are pathways.<slug> and home.pathways.<slug> in i18n/messages. Each tile
// opens the library already filtered to its pathway.
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

// Each step's words are home.steps.<key> in i18n/messages.
const STEPS = ["browse", "register", "hearBack", "getInvolved"];

/**
 * Four "Level" cards, a nod to T-Levels. On desktop they climb left to right
 * like a staircase (see .steps in styles.css); on smaller screens they stack.
 */
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
          <li key={step} className="step" style={{ "--drop": STEPS.length - 1 - index }}>
            <p className="label">
              {t("home.steps.level")} <span className="step__number">{String(index + 1).padStart(2, "0")}</span>
            </p>
            <h3 className="step__title">{t(`home.steps.${step}.title`)}</h3>
            <p className="step__text">{t(`home.steps.${step}.text`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
