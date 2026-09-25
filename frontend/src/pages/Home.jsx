import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useT } from "../i18n/I18nProvider.jsx";
import { useReducedMotion } from "../useReducedMotion.js";
import { AudienceCards, HowItWorks, PathwayTiles, StatsRow } from "../components/HomeSections.jsx";
import { ArrowIcon } from "../components/Icons.jsx";
import RisingSubjects from "../components/RisingSubjects.jsx";

/**
 * The homepage: the hero, then short sections on who the site is for and how
 * it works. The content library itself lives at /resources.
 */
export default function Home() {
  const [audience, setAudience] = useState(null); // null shows the general subhead
  const subhead = useRef(null);
  const reducedMotion = useReducedMotion();

  /**
   * Picking an audience card retargets the hero subhead. The cards sit well
   * below it, so the page brings the subhead into view and outlines it
   * briefly in orange, making the link plain. With reduced motion it jumps
   * there instead and skips the outline. Picking the chosen card again goes
   * back to the general line.
   */
  function chooseAudience(value) {
    setAudience((current) => (current === value ? null : value));

    const line = subhead.current;
    line.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    if (!reducedMotion) {
      line.getAnimations().forEach((animation) => animation.cancel()); // restart, never stack
      const orange = getComputedStyle(document.documentElement).getPropertyValue("--orange");
      line.animate(
        [
          { outlineColor: "transparent" },
          { outlineColor: orange, offset: 0.3 },
          { outlineColor: orange, offset: 0.7 },
          { outlineColor: "transparent" },
        ],
        { duration: 1600, delay: 250, easing: "ease-out" },
      );
    }
  }

  return (
    <>
      <Hero audience={audience} subheadRef={subhead} />
      <StatsRow />
      <AudienceCards selected={audience} onSelect={chooseAudience} />
      <PathwayTiles />
      <HowItWorks />
    </>
  );
}

/* ---------- Hero ---------- */

// The subhead for each audience card, and the general line when none is
// chosen, are home.subheads.<audience> in i18n/messages.

/**
 * Opening band: the page's h1, a subhead that the audience cards further down
 * can retarget, and a way into the library. The rising subjects drift behind
 * it, and a mouse pointer lights up the ones nearby.
 */
function Hero({ audience, subheadRef }) {
  const t = useT();
  const hero = useRef(null);
  useSpotlight(hero);

  return (
    <section ref={hero} className="hero" aria-labelledby="page-title">
      <RisingSubjects />
      <div className="hero__content">
        <h1 id="page-title" className="hero__title">
          {t("home.title")}
        </h1>

        {/* Polite live region, so screen readers hear the new line when an
            audience card is picked. */}
        <p ref={subheadRef} className="hero__subhead" aria-live="polite">
          {t(`home.subheads.${audience ?? "general"}`)}
        </p>

        <Link className="button button--primary" to="/resources">
          {t("home.browse")}
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

/* ---------- Cursor spotlight ---------- */

const SPOTLIGHT_RADIUS = 200; // px from the pointer to the edge of its reach
const SPOTLIGHT_PEAK = 0.14; // opacity of a name right under the pointer (normally 0.03 to 0.05)
const TEXT_CLEARANCE = 24; // px around the hero text where names are never lit

/**
 * Lights up the drifting subject names near a mouse pointer, by setting --lit
 * on each one (see .hero .rising-subjects__item in styles.css). Names that
 * touch the hero's text stay at their normal strength, so the text keeps its
 * contrast. Mouse only: touch has no pointer to follow. Off with reduced
 * motion, where the names are not shown at all.
 */
function useSpotlight(heroRef) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || reducedMotion) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let pointer = null; // viewport position of the mouse while it is over the hero
    let frame = 0;

    function paint() {
      frame = 0;
      const items = [...hero.querySelectorAll(".rising-subjects__item")];
      if (!pointer) {
        items.forEach((item) => item.style.removeProperty("--lit"));
        return;
      }

      // Read every position first, then write, so each frame lays out once.
      const text = [...hero.querySelectorAll(".hero__content > *")].map((el) => el.getBoundingClientRect());
      const levels = items.map((item) => {
        const box = item.getBoundingClientRect();
        const nearText = text.some(
          (t) =>
            box.right > t.left - TEXT_CLEARANCE &&
            box.left < t.right + TEXT_CLEARANCE &&
            box.bottom > t.top - TEXT_CLEARANCE &&
            box.top < t.bottom + TEXT_CLEARANCE,
        );
        if (nearText) return 0;
        // Distance to the nearest point of the name, so long names light up
        // when the pointer is near either end.
        const dx = Math.max(box.left - pointer.x, 0, pointer.x - box.right);
        const dy = Math.max(box.top - pointer.y, 0, pointer.y - box.bottom);
        const reach = Math.max(0, 1 - Math.hypot(dx, dy) / SPOTLIGHT_RADIUS);
        return reach * reach; // eases off towards the edge
      });

      items.forEach((item, i) => {
        if (levels[i] === 0) {
          item.style.removeProperty("--lit");
          return;
        }
        const base = parseFloat(item.style.getPropertyValue("--opacity")) || 0;
        item.style.setProperty("--lit", (base + (SPOTLIGHT_PEAK - base) * levels[i]).toFixed(3));
      });

      // Keep going while the pointer is here: the names drift even when it is still.
      frame = requestAnimationFrame(paint);
    }

    function onMove(event) {
      if (event.pointerType !== "mouse" || !finePointer.matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function onLeave() {
      pointer = null;
      if (!frame) frame = requestAnimationFrame(paint);
    }

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
      hero.querySelectorAll(".rising-subjects__item").forEach((item) => item.style.removeProperty("--lit"));
    };
  }, [heroRef, reducedMotion]);
}
