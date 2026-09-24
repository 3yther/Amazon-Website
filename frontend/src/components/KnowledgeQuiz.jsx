import { useId, useRef, useState } from "react";
import {
  reportCorrectAnswer,
  reportIncorrectAnswer,
  reportQuizFinished,
} from "../assistant/assistantBus.js";
import { KNOWLEDGE_QUESTIONS } from "../knowledgeQuizQuestions.js";
import "./knowledgeQuiz.css";

/**
 * A knowledge check: one question at a time, each with a right answer and an
 * explanation.
 *
 * This is not the same thing as the "Is a T Level right for me?" quiz on the
 * About page. That one is a self assessment, where no answer is wrong. This
 * one can be got wrong, which is what the assistant needs: when an answer is
 * wrong it calls onIncorrectAnswer with the question, the right answer and the
 * explanation, and the assistant offers to talk that question through using
 * the quiz's own wording rather than something it made up.
 *
 * It also tells Smiley about right answers and the final score, so Smiley
 * can be pleased with them. All three callbacks can be passed in; by default
 * they tell Smiley. None of it is sent to the server: it goes to the widget in
 * this browser, and only travels if the visitor then asks Smiley something.
 */
export default function KnowledgeQuiz({
  questions = KNOWLEDGE_QUESTIONS,
  onIncorrectAnswer = reportIncorrectAnswer,
  onCorrectAnswer = reportCorrectAnswer,
  onFinish = reportQuizFinished,
}) {
  const groupId = useId();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const feedbackRef = useRef(null);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const wasRight = checked && chosen === question.correctAnswer;

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
  }

  if (done) {
    return (
      <section className="knowledge-quiz" aria-labelledby="knowledge-quiz-title">
        <p className="label">Knowledge check</p>
        <h2 id="knowledge-quiz-title">You scored {score} out of {questions.length}</h2>
        <p className="knowledge-quiz__lead">
          Anything you are not sure about, ask Smiley in the corner. It will tell you
          if it does not know.
        </p>
        <button type="button" className="button" onClick={startAgain}>
          Start again
        </button>
      </section>
    );
  }

  return (
    <section className="knowledge-quiz" aria-labelledby="knowledge-quiz-title">
      <p className="label">Knowledge check</p>
      <h2 id="knowledge-quiz-title">What do you know about T Levels?</h2>
      <p className="knowledge-quiz__lead">
        {questions.length} questions, one at a time. Getting one wrong is useful: Smiley
        will offer to talk it through.
      </p>

      <form onSubmit={checkAnswer}>
        <fieldset className="knowledge-quiz__question">
          <legend className="knowledge-quiz__legend">
            <span className="label knowledge-quiz__number">
              Question {index + 1} of {questions.length}
            </span>
            {question.question}
          </legend>

          {question.options.map((option) => {
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
                {wasRight ? "That is right." : `Not quite. The right answer: ${question.correctAnswer}.`}
              </p>
              <p>{question.explanation}</p>
            </div>
          )}
        </div>

        <div className="knowledge-quiz__actions">
          {!checked ? (
            <button type="submit" className="button button--primary" disabled={chosen === null}>
              Check answer
            </button>
          ) : (
            <button type="button" className="button button--primary" onClick={nextQuestion}>
              {isLast ? "See my score" : "Next question"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
