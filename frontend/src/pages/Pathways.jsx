import PathwaySwitcher from "../components/PathwaySwitcher.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import "../about.css";

/**
 * Learning Pathways: the five pathways Amazon offers, on their own page. Uses
 * the same tab switcher as the About page, so the detail is written once.
 */
export default function Pathways() {
  const t = useT();
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("pathwaysPage.label")}</p>
        <h1 id="page-title">{t("pathwaysPage.title")}</h1>
        <p className="lead">{t("pathwaysPage.lead")}</p>
      </section>

      <PathwaySwitcher />
    </>
  );
}
