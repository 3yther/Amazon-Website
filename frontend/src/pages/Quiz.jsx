import KnowledgeQuiz from "../components/KnowledgeQuiz.jsx";
import { useSiteContent } from "../i18n/content.js";
import { useI18n } from "../i18n/I18nProvider.jsx";

// The quiz page. Changing language restarts the quiz (the key) because answers are checked as words.
export default function Quiz() {
  const { t, language } = useI18n();
  const questions = useSiteContent().quiz.KNOWLEDGE_QUESTIONS;

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("quiz.page.label")}</p>
        <h1 id="page-title">{t("quiz.page.title")}</h1>
        <p className="lead">{t("quiz.page.lead", { count: questions.length })}</p>
      </section>

      <KnowledgeQuiz key={language} questions={questions} />
    </>
  );
}
