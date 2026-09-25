import KnowledgeQuiz from "../components/KnowledgeQuiz.jsx";
import { useSiteContent } from "../i18n/content.js";
import { useI18n } from "../i18n/I18nProvider.jsx";

/**
 * The knowledge check (/quiz).
 *
 * Its own page for now. The quiz is a self-contained component that takes its
 * questions as a prop, so it can be dropped into About or Help instead if the
 * team would rather it lived there.
 *
 * The questions come in the visitor's language. Changing language starts the
 * quiz again (the key), because the answers are compared as words and a half
 * finished quiz in one language cannot carry on in another.
 */
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
