import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { QUIZ_QUESTIONS, QUIZ_RESULTS } from "../aboutContent.js";
import { AlertIcon } from "./Icons.jsx";

// "Is a T-Level right for me?" quiz, six questions, one screen.
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
function scoreAnswers(answers) {
  const total = QUIZ_QUESTIONS.reduce((sum, question) => {
    const chosen = question.options.find((option) => option.value === answers[question.id]);
    return sum + (chosen ? chosen.score : 0);
  }, 0);

  // QUIZ_RESULTS is ordered highest band first, so the first match wins.
  return QUIZ_RESULTS.find((band) => total >= band.minScore);
}

export default function TLevelQuiz() {
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
      setError(
        `Answer all ${QUIZ_QUESTIONS.length} questions to see your result. You have done ${answeredCount}.`,
      );
      return;
    }

    setResult(scoreAnswers(answers));
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
        <p className="label">Quiz</p>
        <h2 id="quiz-title">Is a T-Level right for me?</h2>
        <p className="section-intro__lead">
          Six questions. There are no wrong answers, and nothing is saved or sent anywhere.
        </p>
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
          {answeredCount} of {QUIZ_QUESTIONS.length} answered
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
            See my result
          </button>
          {(answeredCount > 0 || result) && (
            <button type="button" className="button" onClick={startAgain}>
              Start again
            </button>
          )}
        </div>
      </form>

      {/* Always in the page, empty until there is a result, so the live region
          is already there when the text arrives. */}
      <div role="status" aria-live="polite">
        {result && (
          <article className="quiz__result" tabIndex={-1} ref={resultRef}>
            <p className="label">Your result</p>
            <h3 className="quiz__result-heading">{result.heading}</h3>
            <p>{result.text}</p>
            <p className="quiz__result-note">
              This is a guide to think with, not advice. Talk to a teacher or a careers adviser
              before you decide.
            </p>
            <Link className="button button--primary quiz__result-action" to="/register-interest">
              Register your interest
            </Link>
          </article>
        )}
      </div>
    </section>
  );
}
