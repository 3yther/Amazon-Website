import { useId, useRef, useState } from "react";
import {
  reportCorrectAnswer,
  reportIncorrectAnswer,
  reportQuizFinished,
} from "../assistant/assistantBus.js";
import { useT } from "../i18n/I18nProvider.jsx";
import { KNOWLEDGE_QUESTIONS } from "../knowledgeQuizQuestions.js";
import "./knowledgeQuiz.css";

// Shuffles a copy of the list (Fisher-Yates) so the right answer moves around.
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Each question's options in a fresh random order, keyed by question id. */
function shuffleOptions(questions) {
  return Object.fromEntries(questions.map((q) => [q.id, shuffle(q.options)]));
}

/**
 * The knowledge check quiz. Unlike the "Is a T-Level right for me?" quiz,
 * answers can be wrong. Wrong answers are passed to Smiley so it can offer
 * to explain them.
 */
export default function KnowledgeQuiz({
  questions = KNOWLEDGE_QUESTIONS,
  onIncorrectAnswer = reportIncorrectAnswer,
  onCorrectAnswer = reportCorrectAnswer,
  onFinish = reportQuizFinished,
}) {
  const t = useT();
  const groupId = useId();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  // Shuffled once per attempt, not on every render, so options do not jump
  // around while someone is choosing.
  const [optionOrder, setOptionOrder] = useState(() => shuffleOptions(questions));
  const feedbackRef = useRef(null);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const wasRight = checked && chosen === question.correctAnswer;
  // Questions finished so far, counting this one once its answer is checked.
  const answered = index + (checked ? 1 : 0);

  function checkAnswer(event) {
    event.preventDefault();
    if (chosen === null || checked) return;

    setChecked(true);

    if (chosen === question.correctAnswer) {
      setScore((current) => current + 1);
      onCorrectAnswer({ question: question.question });
    } else {
      onIncorrectAnswer({
        question: question.question,
        correctAnswer: question.correctAnswer,
        chosenAnswer: chosen,
        explanation: question.explanation,
      });
    }

    // Move focus onto the feedback, so a keyboard or screen reader user lands
    // on the answer instead of being left on the button.
    requestAnimationFrame(() => feedbackRef.current?.focus());
  }

  function nextQuestion() {
    if (isLast) {
      setDone(true);
      onFinish({ score, total: questions.length });
      return;
    }
    setIndex((current) => current + 1);
    setChosen(null);
    setChecked(false);
  }

  function startAgain() {
    setIndex(0);
    setChosen(null);
    setChecked(false);
    setScore(0);
    setDone(false);
    setOptionOrder(shuffleOptions(questions));
  }

  if (done) {
    return (
      <section className="knowledge-quiz" aria-labelledby="knowledge-quiz-title">
        <p className="label">{t("quiz.label")}</p>
        <h2 id="knowledge-quiz-title">{t("quiz.scored", { score, total: questions.length })}</h2>
        <p className="knowledge-quiz__lead">{t("quiz.doneLead")}</p>
        <button type="button" className="button" onClick={startAgain}>
          {t("about.quiz.startAgain")}
        </button>
      </section>
    );
  }

  return (
    <section className="knowledge-quiz" aria-label={t("quiz.label")}>
      {/* The bar is only a picture of the "Question 2 of 7" text below, so
          screen readers skip it rather than hear the progress twice. */}
      <div className="knowledge-quiz__progress" aria-hidden="true">
        <div
          className="knowledge-quiz__progress-fill"
          style={{ width: `${(answered / questions.length) * 100}%` }}
        />
      </div>

      <form onSubmit={checkAnswer}>
        <fieldset className="knowledge-quiz__question">
          <legend className="knowledge-quiz__legend">
            <span className="label knowledge-quiz__number">
              {t("quiz.questionOf", { number: index + 1, total: questions.length })}
            </span>
            {question.question}
          </legend>

          {(optionOrder[question.id] ?? question.options).map((option) => {
            const optionId = `${groupId}-${question.id}-${option}`;
            return (
              <div className="knowledge-quiz__option" key={option}>
                <input
                  type="radio"
                  id={optionId}
                  name={`${groupId}-${question.id}`}
                  value={option}
                  checked={chosen === option}
                  disabled={checked}
                  onChange={() => setChosen(option)}
                />
                <label htmlFor={optionId}>{option}</label>
              </div>
            );
          })}
        </fieldset>

        {/* Always here, empty until an answer is checked, so the live region
            already exists when the feedback arrives. */}
        <div role="status" aria-live="polite">
          {checked && (
            <div
              className={`knowledge-quiz__feedback knowledge-quiz__feedback--${
                wasRight ? "right" : "wrong"
              }`}
              tabIndex={-1}
              ref={feedbackRef}
            >
              <p className="knowledge-quiz__verdict">
                {wasRight ? t("quiz.right") : t("quiz.wrong", { answer: question.correctAnswer })}
              </p>
              <p>{question.explanation}</p>
            </div>
          )}
        </div>

        <div className="knowledge-quiz__actions">
          {!checked ? (
            <button type="submit" className="button button--primary" disabled={chosen === null}>
              {t("quiz.check")}
            </button>
          ) : (
            <button type="button" className="button button--primary" onClick={nextQuestion}>
              {isLast ? t("quiz.seeScore") : t("quiz.next")}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
