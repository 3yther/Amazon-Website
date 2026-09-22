import KnowledgeQuiz from "../components/KnowledgeQuiz.jsx";

/**
 * The knowledge check (/quiz).
 *
 * Its own page for now so it can be built and demonstrated without touching
 * About or Help, which are being rewritten on two other branches. Once those
 * land, the quiz can be dropped into whichever page the team wants: it is a
 * self-contained component and takes its questions as a prop.
 */
export default function Quiz() {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Quiz</p>
        <h1 id="page-title">Test what you know</h1>
        <p className="lead">
          Five questions about T Levels and about this site. Nothing is saved, and nobody
          sees your score.
        </p>
      </section>

      <KnowledgeQuiz />
    </>
  );
}
