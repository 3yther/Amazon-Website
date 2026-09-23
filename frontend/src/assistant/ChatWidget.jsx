import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getChatHistory, sendChatMessage } from "../api.js";
import { CloseIcon } from "../components/Icons.jsx";
import { useReducedMotion } from "../useReducedMotion.js";
import AssistantMascot from "./AssistantMascot.jsx";
import { onIncorrectAnswer } from "./assistantBus.js";
import { nudgeForPath, useIdleNudge } from "./useIdleNudge.js";
import "./assistant.css";

const GREETING =
  "Hello. Ask me anything about T Levels, and I will answer if I know it. " +
  "If I do not know, I will say so rather than guess.";

/**
 * The assistant, sitting in the corner of every page.
 *
 * It does three things:
 *   1. answers questions people type (the reactive part)
 *   2. offers help when somebody has gone quiet on a page for a minute
 *   3. offers to explain a quiz question somebody just got wrong
 *
 * Both of the offers are drawn here in the browser and are never sent
 * anywhere. Only what a visitor types goes to the server.
 */
export default function ChatWidget() {
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotion();
  const panelId = useId();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 0, role: "assistant", text: GREETING }]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | error
  // The page a nudge has already happened on, so nobody is nudged twice for
  // the same visit to the same page.
  const [nudgedPath, setNudgedPath] = useState(null);
  // Whether the visitor opened it themselves, which decides whether we move
  // their focus. See the comment on the effect below.
  const [openedByVisitor, setOpenedByVisitor] = useState(false);

  const nextId = useRef(1);
  const inputRef = useRef(null);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const historyLoaded = useRef(false);
  // The quiz question a nudge was about, attached to the next message the
  // visitor sends so the answer explains that question.
  const pendingQuiz = useRef(null);

  const addMessage = useCallback((message) => {
    setMessages((current) => [...current, { id: nextId.current++, ...message }]);
  }, []);

  // --- the two proactive nudges -------------------------------------------

  const handleIdle = useCallback(() => {
    setNudgedPath(pathname);
    addMessage({ role: "assistant", text: nudgeForPath(pathname) });
    setOpen(true);
    setOpenedByVisitor(false);
  }, [addMessage, pathname]);

  useIdleNudge({ enabled: !open && nudgedPath !== pathname, onIdle: handleIdle });

  useEffect(
    () =>
      onIncorrectAnswer(({ question, correctAnswer, explanation }) => {
        // Kept for the next message so the reply is grounded in the quiz's own
        // content rather than written freehand.
        pendingQuiz.current = { question, correctAnswer, explanation };
        setNudgedPath(pathname); // one nudge per page is plenty
        addMessage({
          role: "assistant",
          text: `That one trips a lot of people up. Want me to go through "${question}"? Tell me which part threw you.`,
        });
        setOpen(true);
        setOpenedByVisitor(false);
      }),
    [addMessage, pathname],
  );

  // --- talking to the API --------------------------------------------------

  useEffect(() => {
    // Earlier messages, fetched the first time it is opened rather than on
    // page load, so a visitor who never opens it is never given a session.
    if (!open || historyLoaded.current) return;
    historyLoaded.current = true;

    getChatHistory()
      .then(({ messages: earlier }) => {
        if (!earlier?.length) return;
        setMessages((current) => [
          ...earlier.map((message) => ({
            id: nextId.current++,
            role: message.role,
            text: message.message,
          })),
          ...current,
        ]);
      })
      .catch(() => {}); // an empty history is not worth telling anyone about
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || status === "sending") return;

    const quiz = pendingQuiz.current;
    pendingQuiz.current = null;

    setDraft("");
    addMessage({ role: "user", text: question });
    setStatus("sending");

    try {
      const { reply } = await sendChatMessage(question, quiz);
      addMessage({ role: "assistant", text: reply });
      setStatus("idle");
    } catch {
      // Section 10: the assistant failing must not break anything else. The
      // visitor gets somewhere else to go, and the site carries on.
      addMessage({ role: "assistant", kind: "fallback" });
      setStatus("error");
    }
  }

  // --- opening, closing and focus -----------------------------------------

  function openWidget() {
    setOpen(true);
    setOpenedByVisitor(true);
  }

  const closeWidget = useCallback(() => {
    setOpen(false);
    // Only pull focus back if it is inside the panel, so closing never yanks
    // somebody out of whatever else they were doing.
    if (panelRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    // Focus the box only when the visitor asked for it. A nudge that moved
    // focus would interrupt somebody mid-sentence, so a nudge announces itself
    // through the live region instead and leaves focus alone.
    if (open && openedByVisitor) inputRef.current?.focus();
  }, [open, openedByVisitor]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") closeWidget();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, closeWidget]);

  const log = useRef(null);
  useEffect(() => {
    // Keep the newest message in view. Jumps rather than glides when the
    // visitor has asked for less motion.
    log.current?.scrollTo({
      top: log.current.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [messages, status, reducedMotion]);

  const conversationStarted = messages.some((message) => message.role === "user");

  return (
    <div className={`assistant${reducedMotion ? " assistant--still" : ""}`}>
      {open && (
        <div
          className="assistant__panel"
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label="T-SMILE assistant"
        >
          <div className="assistant__header">
            <p className="label">Assistant</p>
            <button
              type="button"
              className="assistant__close"
              onClick={closeWidget}
              aria-label="Close the assistant"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Said once, quietly: visitors are told the assistant may check in,
              rather than it just happening. It stays until the conversation
              starts, then gets out of the way. */}
          {!conversationStarted && (
            <p className="assistant__disclosure">
              I may offer help if a page goes quiet for a while. That happens in your
              browser only, and is never saved. Your messages are saved so we can keep the
              conversation going.
            </p>
          )}

          <div
            className="assistant__log"
            ref={log}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}

            <p className="assistant__status" role="status">
              {status === "sending" ? "Thinking about that." : ""}
            </p>
          </div>

          <form className="assistant__form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor={`${panelId}-input`}>
              Your question
            </label>
            <input
              id={`${panelId}-input`}
              ref={inputRef}
              className="assistant__input"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about T Levels"
              autoComplete="off"
              maxLength={1000}
            />
            <button
              type="submit"
              className="button button--primary assistant__send"
              disabled={status === "sending" || !draft.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="assistant__toggle"
        ref={toggleRef}
        onClick={open ? closeWidget : openWidget}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        <AssistantMascot reducedMotion={reducedMotion} />
        <span className="sr-only">{open ? "Close the assistant" : "Open the assistant"}</span>
      </button>
    </div>
  );
}

/** One line of the conversation. */
function Message({ message }) {
  if (message.kind === "fallback") {
    return (
      <p className="assistant__message assistant__message--assistant">
        Our assistant is having trouble right now. The <Link to="/help">Help page</Link> and
        the <Link to="/resources">Resources page</Link> are still there in the meantime.
      </p>
    );
  }

  return (
    <p className={`assistant__message assistant__message--${message.role}`}>
      {/* Plain text, so anything typed is shown as typed and never as markup. */}
      {message.text}
    </p>
  );
}
