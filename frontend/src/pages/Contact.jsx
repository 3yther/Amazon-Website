import { Link } from "react-router-dom";
import MessageForm from "../components/MessageForm.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

// Values from the backend's Feedback.Category; labels in i18n/messages (contact).
const CATEGORIES = ["general", "feature"];

// Contact us page. Problems with the site go to Report an issue instead.
export default function Contact() {
  const t = useT();

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("contact.label")}</p>
        <h1 id="page-title">{t("contact.title")}</h1>
        <p className="lead">
          {t("contact.leadBefore")} <Link to="/report-issue">{t("contact.leadLink")}</Link>
          {t("contact.leadAfter")}
        </p>
      </section>

      <MessageForm
        idPrefix="contact"
        categories={CATEGORIES.map((value) => ({ value, label: t(`contact.categories.${value}`) }))}
        messageLabel={t("contact.message")}
        submitLabel={t("contact.submit")}
        sentText={t("contact.sent")}
      />
    </>
  );
}
