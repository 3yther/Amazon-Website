import MessageForm from "../components/MessageForm.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

// Values from the backend's Feedback.Category; labels in i18n/messages (reportIssue).
const CATEGORIES = ["bug", "accessibility"];

/** Report an Issue: tell the team about a bug or an accessibility problem. */
export default function ReportIssue() {
  const t = useT();

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("reportIssue.label")}</p>
        <h1 id="page-title">{t("reportIssue.title")}</h1>
        <p className="lead">{t("reportIssue.lead")}</p>
      </section>

      <MessageForm
        idPrefix="issue"
        categories={CATEGORIES.map((value) => ({ value, label: t(`reportIssue.categories.${value}`) }))}
        messageLabel={t("reportIssue.message")}
        submitLabel={t("reportIssue.submit")}
        sentText={t("reportIssue.sent")}
      />
    </>
  );
}
