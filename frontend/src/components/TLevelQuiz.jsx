import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSiteContent } from "../i18n/content.js";
import { useT } from "../i18n/I18nProvider.jsx";
import { AlertIcon } from "./Icons.jsx";

// "Is a T Level right for me?" quiz, six questions, one screen.
//
// NEW CONCEPT: a group of radio buttons needs a group label, and the way to
// give it one is <fieldset> with a <legend>. A screen reader then reads the
// question before each option, instead of five stray labels. Native radios
// also bring their own keyboard behaviour: arrow keys move between options and
// Tab jumps past the whole group.
//
// NEW CONCEPT: role="status" on the result. The browser reads out anything
// that appears inside it, so a screen reader user hears the result without
// having to go hunting for it. "polite" behaviour, so it waits its turn.

/** Adds up the scores of the chosen options and picks a result band. */
function scoreAnswers(answers, questions, results) {
  const total = questions.reduce((sum, question) => {
    const chosen = question.options.find((option) => option.value === answers[question.id]);
    return sum + (chosen ? chosen.score : 0);
  }, 0);

  // The results are ordered highest band first, so the first match wins.
  return results.find((band) => total >= band.minScore);
}

export default function TLevelQuiz() {
  const t = useT();
  // The questions and results from aboutContent.js, in the visitor's language.
  const { QUIZ_QUESTIONS, QUIZ_RESULTS } = useSiteContent().about;
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  const answeredCount = Object.keys(answers).length;

  function chooseAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setError(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (answeredCount < QUIZ_QUESTIONS.length) {
      setResult(null);
      setError(t("about.quiz.incomplete", { total: QUIZ_QUESTIONS.length, done: answeredCount }));
      return;
    }

    setResult(scoreAnswers(answers, QUIZ_QUESTIONS, QUIZ_RESULTS));
    // Move focus to the result, so a keyboard or screen reader user lands on
    // the answer rather than being left on the button.
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  function startAgain() {
    setAnswers({});
    setResult(null);
    setError(null);
  }

  return (
    <section className="about-section" aria-labelledby="quiz-title">
      <div className="section-intro">
        <p className="label">{t("about.quiz.label")}</p>
        <h2 id="quiz-title">{t("about.quiz.title")}</h2>
        <p className="section-intro__lead">{t("about.quiz.lead")}</p>
      </div>

      <form className="quiz" onSubmit={handleSubmit}>
        <ol className="quiz__questions">
          {QUIZ_QUESTIONS.map((question, index) => (
            <li key={question.id}>
              <fieldset className="quiz__question">
                <legend className="quiz__legend">
                  <span className="quiz__number label">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {question.question}
                </legend>

                {question.options.map((option) => {
                  const id = `${question.id}-${option.value}`;

                  return (
                    <div className="quiz__option" key={option.value}>
                      <input
                        type="radio"
                        id={id}
                        name={question.id}
                        value={option.value}
                        checked={answers[question.id] === option.value}
                        onChange={() => chooseAnswer(question.id, option.value)}
                      />
                      <label htmlFor={id}>{option.label}</label>
                    </div>
                  );
                })}
              </fieldset>
            </li>
          ))}
        </ol>

        <p className="label" role="status">
          {t("about.quiz.progress", { done: answeredCount, total: QUIZ_QUESTIONS.length })}
        </p>

        {error && (
          <div className="notice" role="alert">
            <AlertIcon />
            <div>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="quiz__actions">
          <button type="submit" className="button button--primary">
            {t("about.quiz.seeResult")}
          </button>
          {(answeredCount > 0 || result) && (
            <button type="button" className="button" onClick={startAgain}>
              {t("about.quiz.startAgain")}
            </button>
          )}
        </div>
      </form>

      {/* Always in the page, empty until there is a result, so the live region
          is already there when the text arrives. */}
      <div role="status" aria-live="polite">
        {result && (
          <article className="quiz__result" tabIndex={-1} ref={resultRef}>
            <p className="label">{t("about.quiz.yourResult")}</p>
            <h3 className="quiz__result-heading">{result.heading}</h3>
            <p>{result.text}</p>
            <p className="quiz__result-note">{t("about.quiz.note")}</p>
            <Link className="button button--primary quiz__result-action" to="/register-interest">
              {t("footer.links.registerInterest")}
            </Link>
          </article>
        )}
      </div>
    </section>
  );
}
