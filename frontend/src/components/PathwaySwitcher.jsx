import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PATHWAYS } from "../aboutContent.js";
import {
  BusinessIcon,
  DigitalIcon,
  EngineeringIcon,
  FinanceIcon,
  MediaIcon,
} from "./Icons.jsx";

// The same pathway icons as the homepage tiles, so each subject always has
// the same picture wherever it appears.
const PATHWAY_ICONS = {
  digital: DigitalIcon,
  business: BusinessIcon,
  media: MediaIcon,
  finance: FinanceIcon,
  engineering: EngineeringIcon,
};

// Tabbed switcher for the five pathways Amazon offers.
//
// NEW CONCEPT: the ARIA tabs pattern. A screen reader should hear "tab 2 of 5,
// selected", not five unrelated buttons, so the markup carries:
//   role="tablist" on the row, role="tab" on each button, aria-selected on the
//   chosen one, aria-controls pointing at its panel, and role="tabpanel" with
//   aria-labelledby pointing back at its tab.
//
// NEW CONCEPT: roving tabindex. In a tab list, Tab should move past the whole
// row in one press, and the left and right arrow keys should move between the
// tabs. So only the selected tab has tabIndex 0 and the rest have -1, and the
// arrow keys move the selection and the focus together.

export default function PathwaySwitcher() {
  const [activeSlug, setActiveSlug] = useState(PATHWAYS[0].slug);
  // Holds the five tab buttons, so a key press can focus the next one.
  const tabRefs = useRef([]);

  const activeIndex = PATHWAYS.findIndex((pathway) => pathway.slug === activeSlug);

  function select(index) {
    const next = (index + PATHWAYS.length) % PATHWAYS.length; // wraps at both ends
    setActiveSlug(PATHWAYS[next].slug);
    tabRefs.current[next]?.focus();
  }

  function handleKeyDown(event) {
    const keys = {
      ArrowRight: activeIndex + 1,
      ArrowLeft: activeIndex - 1,
      Home: 0,
      End: PATHWAYS.length - 1,
    };

    if (event.key in keys) {
      event.preventDefault(); // stop Home and End scrolling the page
      select(keys[event.key]);
    }
  }

  return (
    <section className="about-section" aria-labelledby="pathways-title">
      <div className="section-intro">
        <p className="label">Subjects</p>
        <h2 id="pathways-title">The five pathways at Amazon</h2>
        <p className="section-intro__lead">Pick one to see what the placement involves.</p>
      </div>

      <div className="pathways">
        <div className="pathways__tabs" role="tablist" aria-label="Pathways" onKeyDown={handleKeyDown}>
          {PATHWAYS.map((pathway, index) => {
            const selected = pathway.slug === activeSlug;
            const PathwayIcon = PATHWAY_ICONS[pathway.slug];

            return (
              <button
                key={pathway.slug}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`pathway-tab-${pathway.slug}`}
                className="pathways__tab"
                aria-selected={selected}
                aria-controls={`pathway-panel-${pathway.slug}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveSlug(pathway.slug)}
              >
                <PathwayIcon />
                {pathway.name}
              </button>
            );
          })}
        </div>

        {/* NEW CONCEPT: all five panels are in the page, with the four that
            are not selected carrying the hidden attribute. Each tab's
            aria-controls has to point at an element that really exists, so
            rendering only the open one would leave four broken references. */}
        {PATHWAYS.map((pathway) => (
          <div
            key={pathway.slug}
            className="pathways__panel"
            role="tabpanel"
            id={`pathway-panel-${pathway.slug}`}
            aria-labelledby={`pathway-tab-${pathway.slug}`}
            tabIndex={0}
            hidden={pathway.slug !== activeSlug}
          >
            <p className="label">{pathway.summary}</p>
            <h3 className="pathways__title">{pathway.name}</h3>

            <div className="pathways__detail">
              <h4 className="label">T Levels in this pathway</h4>
              <ul className="pathways__list">
                {pathway.tLevels.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>

            <div className="pathways__detail">
              <h4 className="label">On placement</h4>
              <p>{pathway.placement}</p>
            </div>

            <div className="pathways__detail">
              <h4 className="label">Suits</h4>
              <p>{pathway.suits}</p>
            </div>

            {/* Only shown where Amazon has actually said something public about
                that pathway, so the page never claims a placement exists that
                we cannot point at a source for. */}
            {pathway.amazonStatus && <p className="pathways__status">{pathway.amazonStatus}</p>}

            {/* Goes to the content library, where the pathway filter lives. The
                library does not read a pathway out of the URL yet, so this is a
                plain link rather than a promise it cannot keep. */}
            <Link className="button pathways__action" to="/resources">
              Browse resources
            </Link>
          </div>
        ))}

      </div>
    </section>
  );
}
