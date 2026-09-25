import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Smiley's behaviour: its mood, where it looks, blinking, falling asleep,
 * reactions and tricks. Only one mood at a time (see resolveMood).
 * Nothing moves when reduced motion is on, and nothing is sent anywhere.
 */

const ORIGIN = { x: 0, y: 0 };

// Past this many pixels the cursor counts as far away, where the eyes already
// look as far as they go.
const FAR_AWAY_PX = 280;

// Getting sleepy, then falling asleep, when nobody has done anything.
const SLEEPY_MS = 2 * 60 * 1000;
const ASLEEP_MS = 3 * 60 * 1000;
const SLEEP_CHECK_MS = 4000;

// Leaving the tab for this long counts as being away.
const AWAY_MS = 20 * 1000;

// Poke Smiley this many times this quickly and it gets dizzy.
const DIZZY_POKES = 5;
const POKE_WINDOW_MS = 2000;

// With the cursor still for this long, Smiley starts glancing around.
const GLANCE_AFTER_MS = 7000;
const GLANCE_CHECK_MS = 3000;

// Where Smiley looks while busy: up and away while thinking, down at the box
// while you type.
const THINKING_LOOK = { x: 0.7, y: -0.9 };
const LISTENING_LOOK = { x: -0.1, y: 0.9 };

// The one-off movement that goes with each reaction.
const REACTION_MOTION = {
  happy: "hop",
  surprised: "hop",
  celebrating: "bounce",
  dizzy: "sway",
  shy: "sway",
};

// Hovering over Smiley this long makes it shy.
const SHY_AFTER_MS = 5000;

// A nap ("go to sleep" in the chat) lasts this long, whatever you do.
const NAP_MS = 5000;

// Every outfit, in the order the "outfits" trick shows them off.
export const OUTFITS = ["bobble", "witch", "party", "gradcap"];

// Seasonal hats: party hat at new year, bobble hat in winter,
// witch's hat for Halloween and a grad cap on results day.
export function seasonalOutfit(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 12 && day === 31) || (month === 1 && day <= 2)) return "party";
  if (month === 12 || month === 1 || month === 2) return "bobble";
  if (month === 10 && day >= 24) return "witch";
  if (month === 8 && day >= 10 && day <= 20) return "gradcap";
  return null;
}

const ACTIVITY_EVENTS = ["mousemove", "pointerdown", "keydown", "scroll", "touchstart"];

/** The single mood Smiley shows, from everything going on. Reactions win. */
function resolveMood({ reaction, thinking, sleep, listening, hovering }) {
  if (reaction) return reaction;
  if (thinking) return "thinking";
  if (sleep === "asleep") return "asleep";
  if (sleep === "sleepy") return "sleepy";
  if (listening) return "listening";
  if (hovering) return "curious";
  return "neutral";
}

const random = (min, max) => min + Math.random() * (max - min);

export function useSmiley({ reducedMotion }) {
  const faceRef = useRef(null);

  const [cursorLook, setCursorLook] = useState(ORIGIN);
  const [glanceLook, setGlanceLook] = useState(null);
  const [blink, setBlink] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [talking, setTalking] = useState(false);
  const [sleep, setSleep] = useState("awake"); // awake | sleepy | asleep
  const [motion, setMotion] = useState({ name: null, key: 0 });
  const [antenna, setAntenna] = useState({ name: null, key: 0 });
  const [outfit, setOutfit] = useState(() => seasonalOutfit());

  const reactionTimer = useRef(null);
  const glanceTimer = useRef(null);
  const wakeTimer = useRef(null);
  const shyTimer = useRef(null);
  const outfitTimers = useRef([]);
  const pokes = useRef([]);
  const lastCursorMove = useRef(Date.now());
  const sleepRef = useRef("awake");
  // While napping, activity does not wake Smiley until this time.
  const napUntil = useRef(0);

  // --- reactions ------------------------------------------------------------

  const play = useCallback(
    (name) => {
      if (!name || reducedMotion) return;
      setMotion((current) => ({ name, key: current.key + 1 }));
    },
    [reducedMotion],
  );

  /** Wiggle the aerial: "oh, something happened". */
  const wiggle = useCallback(() => {
    if (reducedMotion) return;
    setAntenna((current) => ({ name: "wiggle", key: current.key + 1 }));
  }, [reducedMotion]);

  /** Show a mood for a moment, then settle back. */
  const react = useCallback(
    (mood, ms = 1600) => {
      window.clearTimeout(reactionTimer.current);
      setReaction(mood);
      play(REACTION_MOTION[mood]);
      reactionTimer.current = window.setTimeout(() => setReaction(null), ms);
    },
    [play],
  );

  /** Look somewhere for a moment: x and y from -1 to 1. */
  const glance = useCallback(
    (x, y, ms = 800) => {
      if (reducedMotion) return;
      window.clearTimeout(glanceTimer.current);
      setGlanceLook({ x, y });
      glanceTimer.current = window.setTimeout(() => setGlanceLook(null), ms);
    },
    [reducedMotion],
  );

  /** A poke on the nose. A few is funny; too many makes Smiley dizzy. */
  const poke = useCallback(() => {
    const now = Date.now();
    pokes.current = [...pokes.current.filter((time) => now - time < POKE_WINDOW_MS), now];
    if (pokes.current.length >= DIZZY_POKES) {
      pokes.current = [];
      react("dizzy", 2200);
    } else {
      react("happy", 900);
    }
  }, [react]);

  const celebrate = useCallback(() => {
    react("celebrating", 2600);
    wiggle();
  }, [react, wiggle]);

  /** Hovering: curious straight away, shy if you hover for too long. */
  const hover = useCallback(
    (on) => {
      setHovering(on);
      window.clearTimeout(shyTimer.current);
      if (on) shyTimer.current = window.setTimeout(() => react("shy", 2600), SHY_AFTER_MS);
    },
    [react],
  );

  // A trick asked for in the chat, like "dance" or "flip". Moves are skipped with reduced motion.
  const perform = useCallback(
    (trick) => {
      if (!trick) return;

      if (trick === "nap") {
        napUntil.current = Date.now() + NAP_MS;
        sleepRef.current = "asleep";
        setSleep("asleep");
        return;
      }

      if (trick === "outfits") {
        for (const timer of outfitTimers.current) window.clearTimeout(timer);
        const own = seasonalOutfit();
        outfitTimers.current = [
          ...OUTFITS.map((name, index) => window.setTimeout(() => setOutfit(name), index * 1100)),
          window.setTimeout(() => setOutfit(own), OUTFITS.length * 1100),
        ];
        return;
      }

      if (trick === "wiggle") {
        wiggle();
        return;
      }

      // dance, flip, spin, hop, bounce, sway: each is a CSS animation.
      play(trick);
    },
    [play, wiggle],
  );

  // --- eyes follow the cursor -------------------------------------------------

  useEffect(() => {
    if (reducedMotion) {
      setCursorLook(ORIGIN);
      return undefined;
    }

    let frame = null;
    let latest = null;

    // mousemove fires far more often than the screen redraws, so the handler
    // only keeps the newest position and the maths runs once per frame.
    const handleMove = (event) => {
      latest = event;
      lastCursorMove.current = Date.now();
      if (frame !== null) return;

      frame = window.requestAnimationFrame(() => {
        frame = null;
        const face = faceRef.current;
        if (!face || !latest) return;

        const box = face.getBoundingClientRect();
        const fromX = latest.clientX - (box.left + box.width / 2);
        const fromY = latest.clientY - (box.top + box.height / 2);
        const distance = Math.hypot(fromX, fromY);
        if (distance < 1) return;

        const reach = Math.min(distance / FAR_AWAY_PX, 1);
        setCursorLook({ x: (fromX / distance) * reach, y: (fromY / distance) * reach });
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  // --- blinking ----------------------------------------------------------------

  useEffect(() => {
    if (reducedMotion) {
      setBlink(false);
      return undefined;
    }

    let timer = null;

    const blinkOnce = (then) => {
      setBlink(true);
      timer = window.setTimeout(() => {
        setBlink(false);
        then();
      }, 130);
    };

    // Every few seconds, at an uneven rhythm, with the odd double blink.
    const schedule = () => {
      timer = window.setTimeout(() => {
        blinkOnce(() => {
          if (Math.random() < 0.18) {
            timer = window.setTimeout(() => blinkOnce(schedule), 200);
          } else {
            schedule();
          }
        });
      }, random(2600, 6000));
    };

    schedule();
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  // --- glancing around when the cursor is still ------------------------------

  useEffect(() => {
    if (reducedMotion) return undefined;

    const interval = window.setInterval(() => {
      const still = Date.now() - lastCursorMove.current > GLANCE_AFTER_MS;
      if (still && sleepRef.current === "awake" && Math.random() < 0.35) {
        glance(random(-1, 1), random(-0.3, 0.4), 900);
      }
    }, GLANCE_CHECK_MS);

    return () => window.clearInterval(interval);
  }, [reducedMotion, glance]);

  // --- following the page as it scrolls --------------------------------------

  useEffect(() => {
    if (reducedMotion) return undefined;

    let lastY = window.scrollY;
    let lastGlance = 0;

    const handleScroll = () => {
      const now = Date.now();
      const direction = Math.sign(window.scrollY - lastY);
      lastY = window.scrollY;
      if (!direction || now - lastGlance < 150) return;
      lastGlance = now;
      glance(0, direction * 0.9, 450);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reducedMotion, glance]);

  // --- dozing off, and waking up ----------------------------------------------

  useEffect(() => {
    let lastActivity = Date.now();

    const changeSleep = (next) => {
      sleepRef.current = next;
      setSleep(next);
    };

    const markActive = () => {
      lastActivity = Date.now();
      if (sleepRef.current === "awake") return;
      // A nap asked for in the chat: typing the next question does not count.
      if (Date.now() < napUntil.current) return;

      // Woken up: a start, then pleased to see you.
      changeSleep("awake");
      react("surprised", 700);
      window.clearTimeout(wakeTimer.current);
      wakeTimer.current = window.setTimeout(() => react("happy", 1300), 700);
    };

    const check = () => {
      const quiet = Date.now() - lastActivity;
      if (quiet >= ASLEEP_MS && sleepRef.current !== "asleep") changeSleep("asleep");
      else if (quiet >= SLEEPY_MS && sleepRef.current === "awake") changeSleep("sleepy");
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActive, { passive: true });
    }
    const interval = window.setInterval(check, SLEEP_CHECK_MS);

    return () => {
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, markActive);
      window.clearInterval(interval);
    };
  }, [react]);

  // --- saying hello when you come back to the tab ------------------------------

  useEffect(() => {
    let hiddenAt = null;

    const handleVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
      } else if (hiddenAt && Date.now() - hiddenAt > AWAY_MS) {
        hiddenAt = null;
        react("happy", 1500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [react]);

  // --- tidy up -------------------------------------------------------------------

  useEffect(
    () => () => {
      window.clearTimeout(reactionTimer.current);
      window.clearTimeout(glanceTimer.current);
      window.clearTimeout(wakeTimer.current);
      window.clearTimeout(shyTimer.current);
      for (const timer of outfitTimers.current) window.clearTimeout(timer);
    },
    [],
  );

  // --- what the face shows -------------------------------------------------------

  const mood = resolveMood({ reaction, thinking, sleep, listening, hovering });

  let look = ORIGIN;
  if (!reducedMotion) {
    if (glanceLook) look = glanceLook;
    else if (thinking) look = THINKING_LOOK;
    else if (listening) look = LISTENING_LOOK;
    else look = cursorLook;
  }

  return {
    faceRef,
    face: {
      mood,
      look,
      blink,
      talking,
      motion: motion.name,
      motionKey: motion.key,
      antenna: antenna.name,
      antennaKey: antenna.key,
      outfit,
      still: reducedMotion,
    },
    react,
    glance,
    poke,
    celebrate,
    wiggle,
    perform,
    hover,
    setThinking,
    setListening,
    setHovering,
    setTalking,
  };
}
