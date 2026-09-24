import KnowledgeQuiz from "../components/KnowledgeQuiz.jsx";
import { KNOWLEDGE_QUESTIONS } from "../knowledgeQuizQuestions.js";

/**
 * The knowledge check (/quiz).
 *
 * Its own page for now. The quiz is a self-contained component that takes its
 * questions as a prop, so it can be dropped into About or Help instead if the
 * team would rather it lived there.
 */
export default function Quiz() {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Quiz</p>
        <h1 id="page-title">Test what you know</h1>
        <p className="lead">
          {KNOWLEDGE_QUESTIONS.length} questions about T-Levels, Amazon placements and this
          site. Nothing is saved, and nobody sees your score.
        </p>
      </section>

      <KnowledgeQuiz />
    </>
  );
}
