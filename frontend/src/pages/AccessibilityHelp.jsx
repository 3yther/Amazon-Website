import { Link } from "react-router-dom";
import { IconList } from "../components/InfoBlocks.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import "../about.css";

// Ways to use the site. Words are in i18n/messages (accessibilityHelp.ways).
const WAYS = [
  { icon: "tools", key: "settings" },
  { icon: "key", key: "keyboard" },
  { icon: "info", key: "skip" },
  { icon: "person", key: "screenReaders" },
  { icon: "clock", key: "motion" },
  { icon: "chat", key: "speech" },
];

// Accessibility help page. The actual settings are on /accessibility.
export default function AccessibilityHelp() {
  const t = useT();

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("accessibilityHelp.label")}</p>
        <h1 id="page-title">{t("accessibilityHelp.title")}</h1>
        <p className="lead">{t("accessibilityHelp.lead")}</p>
      </section>

      <section className="about-section" aria-labelledby="ways-title">
        <div className="section-intro">
          <h2 id="ways-title">{t("accessibilityHelp.waysTitle")}</h2>
        </div>
        <IconList items={WAYS.map((way) => ({ icon: way.icon, text: t(`accessibilityHelp.ways.${way.key}`) }))} />
        <p className="route__action">
          <Link className="button button--primary" to="/accessibility">
            {t("accessibilityHelp.openSettings")}
          </Link>
        </p>
      </section>

      <section className="about-section" aria-labelledby="problem-title">
        <div className="section-intro">
          <h2 id="problem-title">{t("accessibilityHelp.problemTitle")}</h2>
          <p className="section-intro__lead">{t("accessibilityHelp.problemLead")}</p>
        </div>
        <Link className="button" to="/report-issue">
          {t("accessibilityHelp.report")}
        </Link>
      </section>
    </>
  );
}
