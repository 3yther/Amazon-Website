import PathwaySwitcher from "../components/PathwaySwitcher.jsx";
import "../about.css";

/**
 * Learning Pathways: the five pathways Amazon offers, on their own page. Uses
 * the same tab switcher as the About page, so the detail is written once.
 */
export default function Pathways() {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Learning Pathways</p>
        <h1 id="page-title">Five pathways</h1>
        <p className="lead">Pick one to see the T-Levels in it and what the placement involves.</p>
      </section>

      <PathwaySwitcher />
    </>
  );
}
