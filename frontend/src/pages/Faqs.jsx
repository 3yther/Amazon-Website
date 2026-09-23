import { Link } from "react-router-dom";
import AboutFaq from "../components/AboutFaq.jsx";
import "../about.css";

/**
 * FAQs: the same questions as the About page, on a page of their own so the
 * footer link lands straight on them. The answers live in aboutContent.js,
 * so both pages always say the same thing.
 */
export default function Faqs() {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">FAQs</p>
        <h1 id="page-title">Questions people ask</h1>
        <p className="lead">
          Not here? Ask Smiley, or see <Link to="/help">Help</Link>.
        </p>
      </section>

      <AboutFaq />
    </>
  );
}
