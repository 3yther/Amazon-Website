import { Link } from "react-router-dom";
import { IconList } from "../components/InfoBlocks.jsx";
import "../about.css";

// How to use the site in the way that suits you. Each point is something the
// site really does (checked against the code), not a promise.
const WAYS = [
  { icon: "tools", text: "Change text size, contrast, spacing and colours in Accessibility settings." },
  { icon: "key", text: "Everything works with a keyboard. Press Tab to move, Enter to choose." },
  { icon: "info", text: "Press Tab once on any page to skip straight to the main content." },
  { icon: "person", text: "Pages are built to work with screen readers such as NVDA and VoiceOver." },
  { icon: "clock", text: "Moving words and animations stop if your device is set to reduce motion." },
  { icon: "chat", text: "Smiley can read its answers out loud. Switch it on in Accessibility settings." },
];

/**
 * Accessibility Help: how to use the site, and how to tell us when something
 * gets in the way. The settings themselves are on /accessibility.
 */
export default function AccessibilityHelp() {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Support</p>
        <h1 id="page-title">Accessibility help</h1>
        <p className="lead">We aim to meet WCAG 2.2 AA, the standard for accessible websites.</p>
      </section>

      <section className="about-section" aria-labelledby="ways-title">
        <div className="section-intro">
          <h2 id="ways-title">Use the site your way</h2>
        </div>
        <IconList items={WAYS} />
        <p className="route__action">
          <Link className="button button--primary" to="/accessibility">
            Open Accessibility settings
          </Link>
        </p>
      </section>

      <section className="about-section" aria-labelledby="problem-title">
        <div className="section-intro">
          <h2 id="problem-title">Something not working for you?</h2>
          <p className="section-intro__lead">
            Tell us which page and what got in the way, and we will fix it.
          </p>
        </div>
        <Link className="button" to="/report-issue">
          Report an accessibility issue
        </Link>
      </section>
    </>
  );
}
