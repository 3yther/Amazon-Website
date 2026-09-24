import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getChatHistory, sendChatMessage } from "../api.js";
import { ChevronDownIcon, CloseIcon } from "../components/Icons.jsx";
import { useSiteContent } from "../i18n/content.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useReducedMotion } from "../useReducedMotion.js";
import Confetti from "./Confetti.jsx";
import SmileyCameo from "./SmileyCameo.jsx";
import SmileyFace from "./SmileyFace.jsx";
import { answerLocally, answerTopic, dontKnow } from "./answers/answerEngine.js";
import { onQuizEvent } from "./assistantBus.js";
import {
  afterAiChips,
  audienceReply,
  fallbackChips,
  greetingFor,
  introMessages,
  isLateNight,
  localReply,
  nudgeForPath,
  quizExplanation,
  quizNudge,
} from "./smileyScript.js";
import { useEasterEggs } from "./useEasterEggs.js";
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
const LOCAL_REPLY_MS = 450; // a beat before a local answer, so it reads as a reply

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

const between = (min, max) => Math.round(min + Math.random() * (max - min));

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
 * How it answers (see answers/answerEngine.js):
 *   safeguarding first, in the browser, never sent anywhere;
 *   then the site's own checked copy, instantly, in the visitor's language;
 *   then the AI, only for what is left and only if the site has one;
 *   then an honest "I don't know that one yet".
 *
 * Personality lives in useSmiley.js (behaviour), SmileyFace.jsx (drawing)
 * and useEasterEggs.js (surprises). Words live in i18n/messages.
 */
export default function ChatWidget() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { t, language } = useI18n();
  const content = useSiteContent();
  const panelId = useId();

  const [open, setOpen] = useState(false);
  const [openedByVisitor, setOpenedByVisitor] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending
  const [audience, setAudience] = useState(() => readSession(AUDIENCE_KEY));
  const [teaser, setTeaser] = useState(null);
  // null until the server says; false means answer everything in the browser.
  const [aiAvailable, setAiAvailable] = useState(null);
  const [cameo, setCameo] = useState(null);
  const [confetti, setConfetti] = useState(false);
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
  const replyTimer = useRef(null);
  // The quiz question a nudge was about. pendingQuiz goes with the next
  // message to the AI; lastQuiz stays so it can be explained without one.
  const pendingQuiz = useRef(null);
  const lastQuiz = useRef(null);
  // The last question sent, so "Try again" can resend it.
  const lastQuestion = useRef(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  /** Everything the answer engine needs, fresh for each answer. */
  const answerContext = useCallback(
    () => ({ t, language, ...content, now: new Date() }),
    [t, language, content],
  );

  const addMessage = useCallback((message) => {
    setMessages((current) => [...current, { id: nextId.current++, ...message }]);
  }, []);

  /** Smiley says something, and its face and body go with it. */
  const say = useCallback(
    (reply, extra = {}) => {
      addMessage({ role: "assistant", text: reply.text, chips: reply.chips, ...extra });
      smiley.react(reply.mood ?? "happy", 1500);
      if (reply.motion) smiley.perform(reply.motion);
      else smiley.wiggle();
    },
    [addMessage, smiley],
  );

  /** A local answer, after a short beat so it reads as a reply. */
  const sayAfterABeat = useCallback(
    (reply, extra) => {
      setStatus("sending");
      smiley.setThinking(true);
      window.clearTimeout(replyTimer.current);
      replyTimer.current = window.setTimeout(() => {
        smiley.setThinking(false);
        setStatus("idle");
        say(reply, extra);
      }, LOCAL_REPLY_MS);
    },
    [say, smiley],
  );

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

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

  // First visit this session: a wave and a hello, once. After 11pm it is a
  // gentle reminder to get some sleep instead.
  useEffect(() => {
    if (readSession(GREETED_KEY)) return undefined;
    const timer = window.setTimeout(() => {
      writeSession(GREETED_KEY, "yes");
      if (openRef.current) return;
      showTeaser(t(isLateNight() ? "smiley.teasers.lateNight" : "smiley.teasers.hello"));
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
    setCameo(null);
    // A fresh conversation starts with a hello and a question.
    setMessages((current) => {
      if (current.length > 0) return current;
      return introMessages(t, audience).map((message) => ({
        id: nextId.current++,
        role: "assistant",
        intro: true,
        ...message,
      }));
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
    const nudge = nudgeForPath(t, pathname);
    addMessage({ role: "assistant", text: nudge.text, chips: nudge.chips, tag: t("smiley.tags.checkingIn") });
    openBySmiley();
    smiley.react("curious", 2200);
    smiley.wiggle();
  }, [addMessage, openBySmiley, pathname, t]);

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
            showTeaser(t("smiley.teasers.perfect"));
          } else {
            smiley.react("happy", 1600);
            showTeaser(t("smiley.teasers.finished"));
          }
          return;
        }

        // A wrong answer. Keep the question, so the reply explains the quiz's
        // own content rather than something written freehand.
        const quiz = {
          question: event.question,
          correctAnswer: event.correctAnswer,
          chosenAnswer: event.chosenAnswer,
          explanation: event.explanation,
        };
        pendingQuiz.current = quiz;
        lastQuiz.current = quiz;
        const nudge = quizNudge(t, event.question);
        addMessage({ role: "assistant", text: nudge.text, chips: nudge.chips, tag: t("smiley.tags.quizHelp") });
        setNudgedPath(pathname);
        smiley.react("sympathetic", 2600);

        // Closed the chat on this page already? Then a quiet bubble, not a pop-up.
        if (closedOnPath === pathname) showTeaser(t("smiley.teasers.quiz"));
        else if (!openRef.current) openBySmiley();
      }),
    [addMessage, closedOnPath, openBySmiley, pathname, showTeaser, t],
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

  // --- easter eggs ------------------------------------------------------------

  const handleEgg = useCallback(
    (type) => {
      switch (type) {
        case "peek":
          if (reducedMotion || openRef.current) return;
          setCameo({ edge: Math.random() < 0.5 ? "left" : "right", spot: between(25, 65) });
          return;
        case "bottom":
          if (openRef.current) return;
          if (!reducedMotion) setCameo({ edge: "bottom", spot: between(20, 60) });
          showTeaser(t("smiley.teasers.bottom"));
          smiley.react("happy", 1600);
          return;
        case "party":
          smiley.celebrate();
          if (!reducedMotion) setConfetti(true);
          if (openRef.current) addMessage({ role: "assistant", text: t("smiley.teasers.party") });
          else showTeaser(t("smiley.teasers.party"));
          return;
        case "offline":
          smiley.react("sympathetic", 3000);
          showTeaser(t("smiley.teasers.offline"));
          return;
        case "online":
          smiley.react("happy", 1600);
          showTeaser(t("smiley.teasers.online"));
          return;
        case "wordmark":
          smiley.react("happy", 1800);
          smiley.wiggle();
          showTeaser(t("smiley.teasers.wordmark"));
          return;
        default:
      }
    },
    [addMessage, reducedMotion, showTeaser, smiley, t],
  );

  useEasterEggs({ onEgg: handleEgg, canPeek: !open && !reducedMotion && !cameo });

  const endCameo = useCallback(() => setCameo(null), []);
  const endConfetti = useCallback(() => setConfetti(false), []);

  // --- talking to the API --------------------------------------------------

  useEffect(() => {
    // Earlier messages, fetched the first time the chat opens rather than on
    // page load, so a visitor who never opens it is never given a session.
    // The same call says whether an AI is set up at all.
    if (!open || historyLoaded.current) return;
    historyLoaded.current = true;

    getChatHistory()
      .then(({ messages: earlier, ai_available: available }) => {
        setAiAvailable(Boolean(available));
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
            text: `${greetingFor(t)} ${t("smiley.welcomeBack")}`,
            restored: true,
          };
          // Somebody Smiley has met: swap the first-time hello for a welcome
          // back, unless they have already started answering it.
          const answered = current.some((message) => message.role === "user");
          const fresh = answered ? current : current.filter((message) => !message.intro);
          return [...restored, welcome, ...fresh];
        });
      })
      // No server at all: Smiley can still answer from the page copy.
      .catch(() => setAiAvailable(false));
  }, [open]);

  /** The best Smiley can do without the AI: a guess it owns up to, or honesty. */
  function answerWithoutAi(local, ctx) {
    if (local) say({ ...local, text: `${t("smiley.answers.closest")}\n${local.text}` });
    else say(dontKnow(ctx));
  }

  async function send(text) {
    const question = text.trim();
    if (!question || status === "sending") return;

    stopSpeech();
    setDraft("");
    smiley.setListening(false);

    const ctx = answerContext();
    const local = answerLocally(question, ctx);

    // Safeguarding and personal details: answered here, never sent anywhere.
    if (local?.kind === "safety") {
      addMessage({ role: "user", text: question, private: true });
      say(local, { tag: t("smiley.tags.private") });
      return;
    }

    addMessage({ role: "user", text: question });

    // Something the site's own copy answers: instant, and word for word.
    if (local?.confident) {
      pendingQuiz.current = null;
      sayAfterABeat(local);
      return;
    }

    // No AI on this site: the closest checked answer, or an honest gap.
    if (aiAvailable === false) {
      pendingQuiz.current = null;
      setStatus("sending");
      smiley.setThinking(true);
      window.setTimeout(() => {
        smiley.setThinking(false);
        setStatus("idle");
        answerWithoutAi(local, ctx);
      }, LOCAL_REPLY_MS);
      return;
    }

    const quiz = pendingQuiz.current;
    pendingQuiz.current = null;
    lastQuestion.current = { text: question, quiz };
    setStatus("sending");
    smiley.setThinking(true);

    try {
      const { reply } = await sendChatMessage(question, { quiz, audience, language });
      addMessage({ role: "assistant", text: reply, chips: afterAiChips(t) });
      smiley.react("happy", 1500);
      smiley.wiggle();
    } catch {
      // Section 10: the AI failing must not break anything else. Smiley falls
      // back to what it knows, and offers a way to try again.
      if (local) {
        answerWithoutAi(local, ctx);
      } else {
        addMessage({ role: "assistant", kind: "fallback", text: t("smiley.fallback"), chips: fallbackChips(t) });
        smiley.react("sympathetic", 2200);
      }
    } finally {
      smiley.setThinking(false);
      setStatus("idle");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    send(draft);
  }

  function handleChip({ label, action }) {
    switch (action.type) {
      case "topic": {
        // Answered from the page copy, in the visitor's language, with or
        // without the AI.
        addMessage({ role: "user", text: label, local: true });
        const reply = answerTopic(action.id, answerContext());
        if (reply) sayAfterABeat(reply);
        break;
      }
      case "audience": {
        // Kept in this tab only. It shapes Smiley's suggestions and replies,
        // and is never stored on the server.
        setAudience(action.value);
        writeSession(AUDIENCE_KEY, action.value);
        addMessage({ role: "user", text: label, local: true });
        sayAfterABeat(audienceReply(t, action.value));
        break;
      }
      case "local": {
        addMessage({ role: "user", text: label, local: true });
        const reply = localReply(t, action.key);
        if (reply) sayAfterABeat(reply);
        break;
      }
      case "quiz": {
        const quiz = lastQuiz.current;
        if (!quiz) break;
        if (aiAvailable === false) {
          // The quiz's own right answer and explanation: checked content.
          addMessage({ role: "user", text: label, local: true });
          sayAfterABeat({ text: quizExplanation(t, quiz), mood: "happy" });
        } else {
          pendingQuiz.current = quiz;
          send(t(action.mode === "whyWrong" ? "smiley.quizWhyWrongAsk" : "smiley.quizExplainAsk"));
        }
        break;
      }
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
    listeningTimer.current = window.setTimeout(() => smiley.setListening(false), LISTENING_PAUSE_MS);
  }

  useEffect(() => () => window.clearTimeout(listeningTimer.current), []);

  // --- speaking and scrolling ------------------------------------------------

  useEffect(() => {
    // Read out everything new Smiley has said (a greeting and its question
    // arrive together), if the visitor turned text to speech on. Earlier
    // messages restored from history are not re-read.
    if (!open) return;
    const unread = messages.filter(
      (message) => message.id > spokenId.current && message.role === "assistant" && !message.restored,
    );
    if (!unread.length) return;
    spokenId.current = messages.at(-1).id;
    speak(unread.map((message) => message.text).join(" "));
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
    status !== "sending" && latest?.role === "assistant" && latest.chips?.length ? latest.chips : null;
  const conversationStarted = messages.some((message) => message.role === "user");

  return (
    // An aside, so the widget sits inside a landmark like the rest of the page.
    // Named "Assistant" so it does not share a name with the dialog inside it.
    <aside className={`assistant${reducedMotion ? " assistant--still" : ""}`} aria-label={t("smiley.landmark")}>
      {open && (
        <div className="assistant__panel" id={panelId} ref={panelRef} role="dialog" aria-labelledby={`${panelId}-name`}>
          <div className="assistant__header">
            <button type="button" className="assistant__poke" onClick={smiley.poke} aria-label={t("smiley.poke")}>
              <SmileyFace ref={smiley.faceRef} {...smiley.face} size={44} />
            </button>
            <div className="assistant__identity">
              <p className="assistant__name" id={`${panelId}-name`}>
                {t("smiley.name")}
              </p>
              <p className="assistant__role">{t(aiAvailable ? "smiley.roleAi" : "smiley.role")}</p>
            </div>
            <button type="button" className="assistant__close" onClick={closeWidget} aria-label={t("smiley.close")}>
              <CloseIcon />
            </button>
          </div>

          {/* Said once, quietly: visitors are told Smiley may check in, rather
              than it just happening. It goes once the conversation starts. */}
          {!conversationStarted && <p className="assistant__disclosure">{t("smiley.disclosure")}</p>}

          <div className="assistant__scroll" ref={scrollRef}>
            <div className="assistant__log" role="log" aria-live="polite" aria-label={t("smiley.conversation")}>
              {messages.map((message, index) => (
                <Message key={message.id} message={message} startsTurn={messages[index - 1]?.role !== "assistant"} />
              ))}

              {status === "sending" && (
                <div className="assistant__turn">
                  <p className="assistant__who">
                    <SmileyFace size={24} mood="thinking" still />
                    <span className="assistant__who-name">{t("smiley.name")}</span>
                  </p>
                  <p className="assistant__thinking">
                    <span className="sr-only">{t("smiley.thinking")}</span>
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
              <div className="assistant__chips" role="group" aria-label={t("smiley.suggested")}>
                {chips.map((chip) => (
                  <button type="button" key={chip.label} className="assistant__chip" onClick={() => handleChip(chip)}>
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className="assistant__form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor={`${panelId}-input`}>
              {t("smiley.inputLabel")}
            </label>
            <input
              id={`${panelId}-input`}
              ref={inputRef}
              className="assistant__input"
              type="text"
              value={draft}
              onChange={handleType}
              onBlur={() => smiley.setListening(false)}
              placeholder={t("smiley.placeholder")}
              autoComplete="off"
              maxLength={1000}
            />
            <button
              type="submit"
              className="button button--primary assistant__send"
              disabled={status === "sending" || !draft.trim()}
            >
              {t("smiley.send")}
            </button>
          </form>
        </div>
      )}

      {!open && teaser && (
        <div className="assistant__teaser">
          <button type="button" className="assistant__teaser-text" onClick={openByVisitor}>
            {teaser}
          </button>
          <button type="button" className="assistant__teaser-close" onClick={hideTeaser} aria-label={t("smiley.dismiss")}>
            <CloseIcon />
          </button>
        </div>
      )}

      {cameo && !open && (
        <SmileyCameo
          edge={cameo.edge}
          spot={cameo.spot}
          outfit={smiley.face.outfit}
          onDone={endCameo}
          onOpen={openByVisitor}
        />
      )}

      {confetti && <Confetti onDone={endConfetti} />}

      <button
        type="button"
        className={`assistant__toggle${open ? " assistant__toggle--open" : ""}${cameo && !open ? " assistant__toggle--ducked" : ""}`}
        ref={toggleRef}
        onClick={open ? closeWidget : openByVisitor}
        onMouseEnter={() => smiley.hover(true)}
        onMouseLeave={() => smiley.hover(false)}
        onFocus={() => smiley.hover(true)}
        onBlur={() => smiley.hover(false)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        {/* One Smiley at a time: in the corner while closed, in the header
            while open, so there are never two pairs of eyes following you.
            While it peeks in from the edge of the screen, the corner one
            ducks out of sight. */}
        {open ? <ChevronDownIcon /> : <SmileyFace ref={smiley.faceRef} {...smiley.face} size={64} grounded />}
        <span className="sr-only">{open ? t("smiley.close") : t("smiley.open")}</span>
      </button>
    </aside>
  );
}

/** One turn of the conversation. */
function Message({ message, startsTurn }) {
  const { t } = useI18n();

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
          <span className="assistant__who-name">{t("smiley.name")}</span>
          {message.tag && <span className="assistant__tag">{message.tag}</span>}
        </p>
      )}
      <p className="assistant__message assistant__message--assistant">{message.text}</p>
    </div>
  );
}
