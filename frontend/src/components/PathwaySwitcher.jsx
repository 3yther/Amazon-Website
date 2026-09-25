import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSiteContent } from "../i18n/content.js";
import { useT } from "../i18n/I18nProvider.jsx";
import { PATHWAY_ICONS } from "./Icons.jsx";

// Tabs for the five pathways. Uses the ARIA tabs pattern, and the arrow keys
// move between tabs (only the selected tab has tabIndex 0).

export default function PathwaySwitcher() {
  const t = useT();
  // The pathways from aboutContent.js, in the visitor's language.
  const PATHWAYS = useSiteContent().about.PATHWAYS;
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
        <p className="label">{t("about.switcher.label")}</p>
        <h2 id="pathways-title">{t("about.switcher.title")}</h2>
        <p className="section-intro__lead">{t("about.switcher.lead")}</p>
      </div>

      <div className="pathways">
        <div className="pathways__tabs" role="tablist" aria-label={t("about.switcher.tabs")} onKeyDown={handleKeyDown}>
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

        {/* All five panels are rendered so aria-controls always points at something. */}
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
              <h4 className="label">{t("about.switcher.tLevels")}</h4>
              <ul className="pathways__list">
                {pathway.tLevels.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>

            <div className="pathways__detail">
              <h4 className="label">{t("about.switcher.onPlacement")}</h4>
              <p>{pathway.placement}</p>
            </div>

            <div className="pathways__detail">
              <h4 className="label">{t("about.switcher.suits")}</h4>
              <p>{pathway.suits}</p>
            </div>

            {/* Only shown if Amazon has said something public about this pathway. */}
            {pathway.amazonStatus && <p className="pathways__status">{pathway.amazonStatus}</p>}

            <div className="pathways__actions">
              {/* The pathway is passed in the address, so the interest form
                  opens with it already chosen. */}
              <Link
                className="button button--primary"
                to={`/register-interest?pathway=${pathway.slug}`}
              >
                {t("about.switcher.registerIn", { name: pathway.name })}
              </Link>
              <Link className="button" to={`/resources?pathway=${pathway.slug}`}>
                {t("home.browse")}
              </Link>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
