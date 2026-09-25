import { Link } from "react-router-dom";
import AboutFaq from "../components/AboutFaq.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import "../about.css";

// FAQs page. Same questions as the About page (from aboutContent.js).
export default function Faqs() {
  const t = useT();
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("faqs.label")}</p>
        <h1 id="page-title">{t("faqs.title")}</h1>
        <p className="lead">
          {t("faqs.leadBefore")} <Link to="/help">{t("faqs.leadLink")}</Link>
          {t("faqs.leadAfter")}
        </p>
      </section>

      <AboutFaq />
    </>
  );
}
