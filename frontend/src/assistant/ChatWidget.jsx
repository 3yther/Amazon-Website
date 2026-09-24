import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getChatHistory, sendChatMessage } from "../api.js";
import { ChevronDownIcon, CloseIcon } from "../components/Icons.jsx";
import { useReducedMotion } from "../useReducedMotion.js";
import SmileyFace from "./SmileyFace.jsx";
import { onQuizEvent } from "./assistantBus.js";
import {
  AFTER_ANSWER_CHIPS,
  AUDIENCE_CHIPS,
  FALLBACK_TEXT,
  INTRO,
  LOCAL_REPLIES,
  RETRY_CHIP,
  TEASERS,
  WELCOME_BACK,
  WHO_QUESTION,
  audienceReply,
  greetingFor,
  nudgeForPath,
  quizNudge,
} from "./smileyScript.js";
import { useIdleNudge } from "./useIdleNudge.js";
import { useSmiley } from "./useSmiley.js";
import { useSpeech } from "./useSpeech.js";
import "./assistant.css";

// Per-visitor conveniences kept for this browser tab only.
const AUDIENCE_KEY = "tsmile:smiley-audience";
const GREETED_KEY = "tsmile:smiley-greeted";

const TEASER_DELAY_MS = 4000; // before Smiley says hello on a first visit
const TEASER_SHOW_MS = 9000; // how long a speech bubble stays
const LISTENING_PAUSE_MS = 1500; // typing pause before Smiley stops "listening"

function readSession(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Private mode or storage switched off: Smiley just asks again next time.
  }
}

/**
 * Smiley, the T-SMILE guide, sitting in the corner of every page.
 *
 * It does three things the brief asks for:
 *   1. answers questions people type (reactive)
 *   2. offers help when a page has gone quiet for a minute (proactive)
 *   3. offers to explain a quiz question somebody just got wrong (proactive)
 * and it asks questions of its own: who is visiting, which pathway interests
 * them, and it suggests what to ask next.
 *
 * Personality lives in useSmiley.js (behaviour) and SmileyFace.jsx (drawing).
 * Everything Smiley says without the AI lives in smileyScript.js.
 *
 * Only what the visitor types or picks is sent to the server. The nudges, the
 * "who's visiting?" answer and every behavioural signal stay in this browser.
 */
export default function ChatWidget() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const panelId = useId();

  const [open, setOpen] = useState(false);
  const [openedByVisitor, setOpenedByVisitor] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [audience, setAudience] = useState(() => readSession(AUDIENCE_KEY));
  const [teaser, setTeaser] = useState(null);
  // The page a nudge already happened on, so nobody is nudged twice on the
  // same visit to the same page.
  const [nudgedPath, setNudgedPath] = useState(null);
  // The page where the visitor closed the chat. Smiley respects that and
  // speaks up in a small bubble instead of opening itself again.
  const [closedOnPath, setClosedOnPath] = useState(null);

  const smiley = useSmiley({ reducedMotion });
  const { setTalking } = smiley;
  const { speak, stop: stopSpeech } = useSpeech({
    onStart: useCallback(() => setTalking(true), [setTalking]),
    onEnd: useCallback(() => setTalking(false), [setTalking]),
  });

  const nextId = useRef(1);
  const openRef = useRef(open);
  const inputRef = useRef(null);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const scrollRef = useRef(null);
  const historyLoaded = useRef(false);
  const spokenId = useRef(0);
  const teaserTimer = useRef(null);
  const listeningTimer = useRef(null);
  // The quiz question a nudge was about, attached to the next message so the
  // answer explains that question.
  const pendingQuiz = useRef(null);
  // The last question sent, so "Try again" can resend it.
  const lastQuestion = useRef(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const addMessage = useCallback((message) => {
    setMessages((current) => [...current, { id: nextId.current++, ...message }]);
  }, []);

  // --- the speech bubble beside Smiley ------------------------------------

  const showTeaser = useCallback((text) => {
    if (openRef.current) return;
    setTeaser(text);
    window.clearTimeout(teaserTimer.current);
    teaserTimer.current = window.setTimeout(() => setTeaser(null), TEASER_SHOW_MS);
  }, []);

  const hideTeaser = useCallback(() => {
    window.clearTimeout(teaserTimer.current);
    setTeaser(null);
  }, []);

  useEffect(() => () => window.clearTimeout(teaserTimer.current), []);

  // First visit this session: a wave and a hello, once.
  useEffect(() => {
    if (readSession(GREETED_KEY)) return undefined;
    const timer = window.setTimeout(() => {
      writeSession(GREETED_KEY, "yes");
      if (openRef.current) return;
      showTeaser(TEASERS.hello);
      smiley.react("happy", 1800);
      smiley.wiggle();
    }, TEASER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // --- opening and closing --------------------------------------------------

  /** A proactive open: Smiley speaks up, but never takes the visitor's focus. */
  const openBySmiley = useCallback(() => {
    hideTeaser();
    setOpen(true);
    setOpenedByVisitor(false);
  }, [hideTeaser]);

  function openByVisitor() {
    hideTeaser();
    // A fresh conversation starts with a hello and a question.
    setMessages((current) => {
      if (current.length > 0) return current;
      const intro = [
        { id: nextId.current++, role: "assistant", intro: true, text: `${greetingFor()} ${INTRO}` },
      ];
      const follow = audience
        ? audienceReply(audience, { opener: false })
        : { text: WHO_QUESTION, chips: AUDIENCE_CHIPS };
      return [...intro, { id: nextId.current++, role: "assistant", intro: true, ...follow }];
    });
    setOpen(true);
    setOpenedByVisitor(true);
    smiley.react("happy", 1200);
  }

  const closeWidget = useCallback(() => {
    setOpen(false);
    setClosedOnPath(pathname);
    stopSpeech();
    // Only pull focus back if it was inside the panel, so closing never yanks
    // somebody out of whatever else they were doing.
    if (panelRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
  }, [pathname, stopSpeech]);

  useEffect(() => {
    // Focus the box only when the visitor opened the chat. A nudge that moved
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

  // --- the two proactive nudges -------------------------------------------

  const handleIdle = useCallback(() => {
    setNudgedPath(pathname);
    const nudge = nudgeForPath(pathname);
    addMessage({ role: "assistant", text: nudge.text, chips: nudge.chips, tag: "Checking in" });
    openBySmiley();
    smiley.react("curious", 2200);
    smiley.wiggle();
  }, [addMessage, openBySmiley, pathname]);

  useIdleNudge({ enabled: !open && nudgedPath !== pathname, onIdle: handleIdle });

  useEffect(
    () =>
      onQuizEvent((event) => {
        if (event.type === "correct") {
          smiley.react("happy", 1400);
          return;
        }

        if (event.type === "finished") {
          if (event.score === event.total) {
            smiley.celebrate();
            showTeaser(TEASERS.perfect);
          } else {
            smiley.react("happy", 1600);
            showTeaser(TEASERS.finished);
          }
          return;
        }

        // A wrong answer. Keep the question, so the reply explains the quiz's
        // own content rather than something written freehand.
        pendingQuiz.current = {
          question: event.question,
          correctAnswer: event.correctAnswer,
          chosenAnswer: event.chosenAnswer,
          explanation: event.explanation,
        };
        const nudge = quizNudge(event.question);
        addMessage({ role: "assistant", text: nudge.text, chips: nudge.chips, tag: "Quiz help" });
        setNudgedPath(pathname);
        smiley.react("sympathetic", 2600);

        // Closed the chat on this page already? Then a quiet bubble, not a pop-up.
        if (closedOnPath === pathname) showTeaser(TEASERS.quiz);
        else if (!openRef.current) openBySmiley();
      }),
    [addMessage, closedOnPath, openBySmiley, pathname, showTeaser],
  );

  // A new page: Smiley glances over at it.
  const firstPath = useRef(true);
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    if (!openRef.current) smiley.glance(-1, -0.4, 900);
  }, [pathname]);

  // --- talking to the API --------------------------------------------------

  useEffect(() => {
    // Earlier messages, fetched the first time the chat opens rather than on
    // page load, so a visitor who never opens it is never given a session.
    if (!open || historyLoaded.current) return;
    historyLoaded.current = true;

    getChatHistory()
      .then(({ messages: earlier }) => {
        if (!earlier?.length) return;
        setMessages((current) => {
          const restored = earlier.map((message) => ({
            id: nextId.current++,
            role: message.role,
            text: message.message,
            restored: true,
          }));
          const welcome = {
            id: nextId.current++,
            role: "assistant",
            text: `${greetingFor()} ${WELCOME_BACK}`,
            restored: true,
          };
          // Somebody Smiley has met: swap the first-time hello for a welcome
          // back, unless they have already started answering it.
          const answered = current.some((message) => message.role === "user");
          const fresh = answered ? current : current.filter((message) => !message.intro);
          return [...restored, welcome, ...fresh];
        });
      })
      .catch(() => {}); // an empty history is not worth telling anyone about
  }, [open]);

  async function send(text) {
    const question = text.trim();
    if (!question || status === "sending") return;

    const quiz = pendingQuiz.current;
    pendingQuiz.current = null;
    lastQuestion.current = { text: question, quiz };

    stopSpeech();
    setDraft("");
    addMessage({ role: "user", text: question });
    setStatus("sending");
    smiley.setListening(false);
    smiley.setThinking(true);

    try {
      const { reply } = await sendChatMessage(question, { quiz, audience });
      addMessage({ role: "assistant", text: reply, chips: AFTER_ANSWER_CHIPS });
      setStatus("idle");
      smiley.react("happy", 1500);
      smiley.wiggle();
    } catch {
      // Section 10: Smiley failing must not break anything else. The visitor
      // gets a way to try again and somewhere else to go.
      addMessage({ role: "assistant", kind: "fallback", chips: [RETRY_CHIP] });
      setStatus("error");
      smiley.react("sympathetic", 2200);
    } finally {
      smiley.setThinking(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    send(draft);
  }

  function handleChip({ label, action }) {
    switch (action.type) {
      case "audience": {
        // Kept in this tab only. It shapes Smiley's suggestions and replies,
        // and is never stored on the server.
        setAudience(action.value);
        writeSession(AUDIENCE_KEY, action.value);
        addMessage({ role: "user", text: label, local: true });
        addMessage({ role: "assistant", ...audienceReply(action.value) });
        smiley.react("happy", 1200);
        break;
      }
      case "local":
        addMessage({ role: "user", text: label, local: true });
        addMessage({ role: "assistant", ...LOCAL_REPLIES[action.key] });
        smiley.react("happy", 1000);
        break;
      case "link":
        navigate(action.to);
        smiley.react("happy", 1000);
        break;
      case "retry":
        if (lastQuestion.current) {
          pendingQuiz.current = lastQuestion.current.quiz;
          send(lastQuestion.current.text);
        }
        break;
      default:
        send(action.text);
    }
    // The chips vanish once used, so keep a keyboard user inside the chat.
    inputRef.current?.focus();
  }

  function handleType(event) {
    setDraft(event.target.value);
    smiley.setListening(true);
    window.clearTimeout(listeningTimer.current);
    listeningTimer.current = window.setTimeout(
      () => smiley.setListening(false),
      LISTENING_PAUSE_MS,
    );
  }

  useEffect(() => () => window.clearTimeout(listeningTimer.current), []);

  // --- speaking and scrolling ------------------------------------------------

  useEffect(() => {
    // Read out everything new Smiley has said (a greeting and its question
    // arrive together), if the visitor turned text to speech on. Earlier
    // messages restored from history are not re-read.
    if (!open) return;
    const unread = messages.filter(
      (message) =>
        message.id > spokenId.current && message.role === "assistant" && !message.restored,
    );
    if (!unread.length) return;
    spokenId.current = messages.at(-1).id;
    speak(
      unread
        .map((message) => (message.kind === "fallback" ? FALLBACK_TEXT : message.text))
        .join(" "),
    );
  }, [messages, open, speak]);

  useEffect(() => {
    // Keep the newest message in view. Jumps rather than glides when the
    // visitor has asked for less motion.
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [messages, status, reducedMotion]);

  const latest = messages.at(-1);
  const chips =
    status !== "sending" && latest?.role === "assistant" && latest.chips?.length
      ? latest.chips
      : null;
  const conversationStarted = messages.some((message) => message.role === "user");

  return (
    // An aside, so the widget sits inside a landmark like the rest of the page.
    // Named "Assistant" so it does not share a name with the dialog inside it.
    <aside
      className={`assistant${reducedMotion ? " assistant--still" : ""}`}
      aria-label="Assistant"
    >
      {open && (
        <div
          className="assistant__panel"
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-labelledby={`${panelId}-name`}
        >
          <div className="assistant__header">
            <button
              type="button"
              className="assistant__poke"
              onClick={smiley.poke}
              aria-label="Poke Smiley"
            >
              <SmileyFace ref={smiley.faceRef} {...smiley.face} size={44} />
            </button>
            <div className="assistant__identity">
              <p className="assistant__name" id={`${panelId}-name`}>
                Smiley
              </p>
              <p className="assistant__role">T-Level guide, powered by AI</p>
            </div>
            <button
              type="button"
              className="assistant__close"
              onClick={closeWidget}
              aria-label="Close Smiley"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Said once, quietly: visitors are told Smiley may check in, rather
              than it just happening. It goes once the conversation starts. */}
          {!conversationStarted && (
            <p className="assistant__disclosure">
              I might pop up if a page goes quiet for a while. That's worked out in your
              browser and never saved. What you type to me is saved, so we can pick up where
              we left off.
            </p>
          )}

          <div className="assistant__scroll" ref={scrollRef}>
            <div
              className="assistant__log"
              role="log"
              aria-live="polite"
              aria-label="Conversation with Smiley"
            >
              {messages.map((message, index) => (
                <Message
                  key={message.id}
                  message={message}
                  startsTurn={messages[index - 1]?.role !== "assistant"}
                />
              ))}

              {status === "sending" && (
                <div className="assistant__turn">
                  <p className="assistant__who">
                    <SmileyFace size={24} mood="thinking" still />
                    <span className="assistant__who-name">Smiley</span>
                  </p>
                  <p className="assistant__thinking">
                    <span className="sr-only">Smiley is thinking</span>
                    <span className="assistant__dot" />
                    <span className="assistant__dot" />
                    <span className="assistant__dot" />
                  </p>
                </div>
              )}
            </div>

            {/* Outside the live region, so the suggestions are not read out
                every time, but still reachable straight after the message. */}
            {chips && (
              <div className="assistant__chips" role="group" aria-label="Suggested replies">
                {chips.map((chip) => (
                  <button
                    type="button"
                    key={chip.label}
                    className="assistant__chip"
                    onClick={() => handleChip(chip)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className="assistant__form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor={`${panelId}-input`}>
              Your question for Smiley
            </label>
            <input
              id={`${panelId}-input`}
              ref={inputRef}
              className="assistant__input"
              type="text"
              value={draft}
              onChange={handleType}
              onBlur={() => smiley.setListening(false)}
              placeholder="Ask Smiley anything"
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

      {!open && teaser && (
        <div className="assistant__teaser">
          <button type="button" className="assistant__teaser-text" onClick={openByVisitor}>
            {teaser}
          </button>
          <button
            type="button"
            className="assistant__teaser-close"
            onClick={hideTeaser}
            aria-label="Dismiss Smiley's message"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <button
        type="button"
        className={`assistant__toggle${open ? " assistant__toggle--open" : ""}`}
        ref={toggleRef}
        onClick={open ? closeWidget : openByVisitor}
        onMouseEnter={() => smiley.setHovering(true)}
        onMouseLeave={() => smiley.setHovering(false)}
        onFocus={() => smiley.setHovering(true)}
        onBlur={() => smiley.setHovering(false)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        {/* One Smiley at a time: in the corner while closed, in the header
            while open, so there are never two pairs of eyes following you. */}
        {open ? (
          <ChevronDownIcon />
        ) : (
          <SmileyFace ref={smiley.faceRef} {...smiley.face} size={64} grounded />
        )}
        <span className="sr-only">{open ? "Close Smiley" : "Open Smiley, your T-Level guide"}</span>
      </button>
    </aside>
  );
}

/** One turn of the conversation. */
function Message({ message, startsTurn }) {
  if (message.role === "user") {
    return (
      <p className="assistant__message assistant__message--user">
        {/* Plain text, so anything typed shows as typed and never as markup. */}
        {message.text}
      </p>
    );
  }

  const fallback = message.kind === "fallback";

  return (
    <div className="assistant__turn">
      {(startsTurn || message.tag) && (
        <p className="assistant__who">
          <SmileyFace size={24} mood={fallback ? "sympathetic" : "neutral"} still />
          <span className="assistant__who-name">Smiley</span>
          {message.tag && <span className="assistant__tag">{message.tag}</span>}
        </p>
      )}
      <p className="assistant__message assistant__message--assistant">
        {fallback ? (
          <>
            I can't answer right now. Try again in a moment, or have a look at the{" "}
            <Link to="/help">Help page</Link> or the <Link to="/resources">Resources page</Link>.
          </>
        ) : (
          message.text
        )}
      </p>
    </div>
  );
}
