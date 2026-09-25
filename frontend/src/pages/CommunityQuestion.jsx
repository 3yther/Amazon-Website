import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, acceptAnswer, answerQuestion, deleteAnswer, deleteQuestion, getQuestion } from "../api.js";
import { useAuth } from "../auth.jsx";
import {
  Author,
  HelpfulButton,
  Notice,
  ReportControl,
  moderationMessage,
  useFormatDate,
} from "../community/CommunityParts.jsx";
import { TextareaField } from "../components/FormFields.jsx";
import { AlertIcon } from "../components/Icons.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

/**
 * One Community question with its answers (/community/:id).
 *
 * The answer that helped the asker comes first, then the most helpful. The
 * asker can mark the answer that helped; anyone signed in can mark posts
 * helpful or report them; authors can delete their own.
 */
export default function CommunityQuestion() {
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const { user, checked } = useAuth();
  const signedIn = Boolean(checked && user);

  const [question, setQuestion] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | missing | error
  const [attempt, setAttempt] = useState(0);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [answerError, setAnswerError] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const errorRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getQuestion(id, { signal: controller.signal })
      .then((data) => {
        setQuestion(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setStatus(error instanceof ApiError && error.status === 404 ? "missing" : "error");
      });
    return () => controller.abort();
  }, [id, attempt, user]);

  function updateQuestion(changes) {
    setQuestion((current) => ({ ...current, ...changes }));
  }

  function updateAnswer(answerId, changes) {
    setQuestion((current) => ({
      ...current,
      answers: current.answers.map((answer) => (answer.id === answerId ? { ...answer, ...changes } : answer)),
    }));
  }

  async function postAnswer(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    setPosting(true);
    setAnswerError(null);
    try {
      await answerQuestion(id, draft);
      setDraft("");
      setAnnouncement(t("community.answerPosted"));
      setAttempt((n) => n + 1); // reload, so the new answer shows in its place
    } catch (error) {
      setAnswerError(moderationMessage(t, error) ?? error.body?.body?.[0] ?? t("community.somethingWrong"));
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setPosting(false);
    }
  }

  async function toggleAccepted(answer) {
    try {
      const { is_accepted: accepted } = await acceptAnswer(answer.id);
      setQuestion((current) => ({
        ...current,
        has_accepted: accepted,
        answers: current.answers.map((item) => ({
          ...item,
          is_accepted: item.id === answer.id ? accepted : accepted ? false : item.is_accepted,
        })),
      }));
    } catch {
      setAnnouncement(t("community.somethingWrong"));
    }
  }

  async function removeQuestion() {
    if (!window.confirm(t("community.deleteConfirm"))) return;
    try {
      await deleteQuestion(id);
      navigate("/community");
    } catch {
      setAnnouncement(t("community.somethingWrong"));
    }
  }

  async function removeAnswer(answerId) {
    if (!window.confirm(t("community.deleteConfirm"))) return;
    try {
      await deleteAnswer(answerId);
      setQuestion((current) => ({
        ...current,
        answers: current.answers.filter((answer) => answer.id !== answerId),
      }));
      setAnnouncement(t("community.deleted"));
    } catch {
      setAnnouncement(t("community.somethingWrong"));
    }
  }

  if (status === "loading" && !question) {
    return (
      <p className="label results-status" role="status">
        {t("community.loading")}
      </p>
    );
  }

  if (status === "missing") {
    return (
      <section aria-labelledby="page-title" className="intro">
        <h1 id="page-title">{t("community.title")}</h1>
        <p className="lead">{t("community.notFound")}</p>
        <p>
          <Link to="/community">{t("community.back")}</Link>
        </p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <Notice tone="error">
        <p>{t("community.loadError")}</p>
        <button type="button" className="button" onClick={() => setAttempt((n) => n + 1)}>
          {t("community.retry")}
        </button>
      </Notice>
    );
  }

  const isAsker = question.is_mine;

  return (
    <article className="community-question" aria-labelledby="page-title">
      <p>
        <Link to="/community">{t("community.back")}</Link>
      </p>

      <header className="community-question__header">
        <p className="label">{t(`community.topics.${question.topic}`)}</p>
        <h1 id="page-title">{question.title}</h1>
        {question.hidden && <p className="community-hidden">{t("community.hiddenNotice")}</p>}
        {question.body && <p className="community-question__body">{question.body}</p>}
        <p className="community-card__meta">
          {question.pathway && <span className="tag">{question.pathway.name}</span>}
          <Author author={question.author} />
          <span className="community-meta">{t("community.askedOn", { date: formatDate(question.created_at) })}</span>
        </p>
        <div className="community-actions">
          <HelpfulButton
            kind="questions"
            post={question}
            signedIn={signedIn}
            onChange={(changes) => updateQuestion(changes)}
          />
          {signedIn && !question.is_mine && <ReportControl kind="questions" postId={question.id} />}
          {question.is_mine && (
            <button type="button" className="community-action" onClick={removeQuestion}>
              {t("community.delete")}
            </button>
          )}
        </div>
      </header>

      <p className="sr-only" role="status">
        {announcement}
      </p>

      <section className="community-answers" aria-labelledby="answers-title">
        <h2 id="answers-title">
          {question.answers.length === 0
            ? t("community.noAnswers")
            : question.answers.length === 1
              ? t("community.oneAnswer")
              : t("community.answers", { count: question.answers.length })}
        </h2>

        <ol className="community-answer-list">
          {question.answers.map((answer) => (
            <li key={answer.id} className={`community-answer${answer.is_accepted ? " community-answer--accepted" : ""}`}>
              {answer.is_accepted && <p className="community-accepted">{t("community.accepted")}</p>}
              {answer.hidden && <p className="community-hidden">{t("community.hiddenNotice")}</p>}
              <p className="community-answer__body">{answer.body}</p>
              <p className="community-card__meta">
                <Author author={answer.author} />
                <span className="community-meta">
                  {t("community.answeredOn", { date: formatDate(answer.created_at) })}
                </span>
              </p>
              <div className="community-actions">
                <HelpfulButton
                  kind="answers"
                  post={answer}
                  signedIn={signedIn}
                  onChange={(changes) => updateAnswer(answer.id, changes)}
                />
                {isAsker && !answer.is_mine && (
                  <button
                    type="button"
                    className="community-action"
                    aria-pressed={answer.is_accepted}
                    onClick={() => toggleAccepted(answer)}
                  >
                    {answer.is_accepted ? t("community.unmarkAccepted") : t("community.markAccepted")}
                  </button>
                )}
                {signedIn && !answer.is_mine && <ReportControl kind="answers" postId={answer.id} />}
                {answer.is_mine && (
                  <button type="button" className="community-action" onClick={() => removeAnswer(answer.id)}>
                    {t("community.delete")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {signedIn ? (
        !question.hidden && (
          <form className="community-answer-form" onSubmit={postAnswer} noValidate>
            {answerError && (
              <div className="notice" role="alert" tabIndex={-1} ref={errorRef}>
                <AlertIcon />
                <div>
                  <p>{answerError}</p>
                </div>
              </div>
            )}
            <TextareaField
              id="answer-body"
              label={t("community.yourAnswer")}
              hint={t("community.answerHint")}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={2000}
              rows={4}
            />
            <button type="submit" className="button button--primary" disabled={posting || !draft.trim()}>
              {posting ? t("community.posting") : t("community.postAnswer")}
            </button>
          </form>
        )
      ) : (
        <p className="community-signin">
          <Link className="button button--primary" to="/login">
            {t("community.signInToAnswer")}
          </Link>
          <span className="community-meta">{t("community.signInToAct")}</span>
        </p>
      )}
    </article>
  );
}
