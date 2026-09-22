import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import parentPhoto from "../assets/audience-parent.jpg";
import studentPhoto from "../assets/audience-student.jpg";
import teacherPhoto from "../assets/audience-teacher.jpg";
import { AUDIENCES, CONTENT_TYPES, PATHWAY_NAMES } from "../labels.js";
import { T_LEVEL_SUBJECTS } from "../tlevelSubjects.js";
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
const STATS = [
  { value: T_LEVEL_SUBJECTS.length, label: "Named T-Levels" },
  { value: PATHWAY_NAMES.length, label: "Pathways" },
  { value: Object.keys(CONTENT_TYPES).length, label: "Resource types" },
  { value: Object.keys(AUDIENCES).filter((key) => key !== "all").length, label: "Audiences" },
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
  const list = useRef(null);
  const progress = useCountUp(list);
  const eased = 1 - (1 - progress) ** 3; // fast start, gentle landing

  return (
    <section className="stats" aria-labelledby="stats-title">
      <h2 id="stats-title" className="sr-only">
        T-Levels at a glance
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
              {stat.label}
            </span>
            <span className="sr-only">{`${stat.value} ${stat.label}`}</span>
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
const AUDIENCE_CARDS = [
  {
    audience: "teacher",
    photo: teacherPhoto,
    title: "Resources ready for your classroom",
    text: "Class packs and guides that introduce T-Levels to your students.",
  },
  {
    audience: "parent",
    photo: parentPhoto,
    title: "Help them choose with confidence",
    text: "Plain guides to what T-Levels involve and where they lead.",
  },
  {
    audience: "student",
    photo: studentPhoto,
    title: "Learn it in class, use it at work",
    text: "Study a subject you care about, with real work experience built in.",
  },
];

/**
 * The three audience cards double as the audience choice for the hero
 * subhead (see Home.jsx). Each card's headline is a real toggle button,
 * inside the h3 so the heading stays a heading, and its click area is
 * stretched over the whole card in styles.css.
 */
export function AudienceCards({ selected, onSelect }) {
  return (
    <section className="home-section" aria-labelledby="audiences-title">
      <div className="section-intro">
        <p className="label">Who it is for</p>
        <h2 id="audiences-title">Teachers, parents and students</h2>
        <p className="section-intro__lead">Pick one to tailor the introduction at the top of the page.</p>
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
                  Selected
                </span>
              )}
              <div className="audience-card__body">
                <p className="label">{AUDIENCES[card.audience]}</p>
                <h3>
                  <button
                    type="button"
                    className="audience-card__button"
                    aria-pressed={isSelected}
                    onClick={() => onSelect(card.audience)}
                  >
                    {card.title}
                  </button>
                </h3>
                <p>{card.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- Pathway tiles ---------- */

// Names, slugs and summaries match backend/content/fixtures/pathways.json.
// Each tile opens the library already filtered to its pathway.
const PATHWAYS = [
  { name: "Digital", slug: "digital", summary: "Build, run and support technology.", Icon: DigitalIcon },
  { name: "Business", slug: "business", summary: "Keep teams and operations running.", Icon: BusinessIcon },
  { name: "Media", slug: "media", summary: "Plan, make and publish content.", Icon: MediaIcon },
  { name: "Finance", slug: "finance", summary: "Work with the numbers behind decisions.", Icon: FinanceIcon },
  {
    name: "Engineering",
    slug: "engineering",
    summary: "Design, build and maintain systems.",
    Icon: EngineeringIcon,
  },
];

export function PathwayTiles() {
  return (
    <section className="home-section" aria-labelledby="pathways-title">
      <div className="section-intro">
        <p className="label">Pathways</p>
        <h2 id="pathways-title">Explore by pathway</h2>
        <p className="section-intro__lead">
          Each covers a group of related T-Levels. Pick one to see its resources.
        </p>
      </div>

      <ul className="pathway-grid">
        {PATHWAYS.map(({ name, slug, summary, Icon }) => (
          <li key={name}>
            <Link className="pathway-tile" to={`/resources?pathway=${slug}`}>
              <Icon />
              <span className="pathway-tile__name">{name}</span>
              <span className="pathway-tile__summary">{summary}</span>
              <ArrowIcon />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- How it works ---------- */

const STEPS = [
  { title: "Browse resources", text: "Guides, packs and videos for all five pathways." },
  { title: "Register interest", text: "Tell us which pathway you want to explore." },
  { title: "Hear back", text: "We review each submission and reply by email." },
  { title: "Get involved", text: "Sign up to open more resources for your pathway." },
];

/**
 * Four "Level" cards, a nod to T-Levels. On desktop they climb left to right
 * like a staircase (see .steps in styles.css); on smaller screens they stack.
 */
export function HowItWorks() {
  return (
    <section className="home-section" aria-labelledby="steps-title">
      <div className="section-intro">
        <p className="label">How it works</p>
        <h2 id="steps-title">Start in four steps</h2>
      </div>

      <ol className="steps">
        {STEPS.map((step, index) => (
          // --drop: how many steps below the top card this one starts.
          <li key={step.title} className="step" style={{ "--drop": STEPS.length - 1 - index }}>
            <p className="label">
              Level <span className="step__number">{String(index + 1).padStart(2, "0")}</span>
            </p>
            <h3 className="step__title">{step.title}</h3>
            <p className="step__text">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
