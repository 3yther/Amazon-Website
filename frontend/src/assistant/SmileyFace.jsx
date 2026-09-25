import { forwardRef, useId } from "react";

/**
 * Smiley, drawn. This component only draws: what Smiley is feeling, where it
 * is looking and whether it is blinking all come in as props, from
 * useSmiley.js. Any number of these can be on a page; only the one attached to
 * useSmiley is "alive".
 *
 * DESIGN: inspired by the hooded, dark-faced, big-eyed style of TryHackMe's
 * Echo, but its own character. A round hood rather than a pointed one, a
 * T-shaped aerial for T-Levels, and a mouth, which Echo does not have. Drawn in
 * Amazon Orange and Amazon Dark Blue only.
 *
 * BRAND: the smile is a plain symmetric curve with rounded ends, inside the
 * face. No arrow, no swoosh, nothing that could be read as the Amazon smile,
 * which the brief says must never be altered. The real logo is left alone.
 *
 * COLOURS: the character uses the fixed brand tokens (--orange, --paper-dark,
 * --text-dark), not --blue and --paper, because dark mode swaps those two and
 * Smiley should look like Smiley in either theme.
 *
 * ACCESSIBILITY: purely decorative, so hidden from screen readers. Whatever
 * it shows is also said in words somewhere else.
 */

// Moods that keep round open eyes, and so can blink.
const OPEN_EYED = new Set(["neutral", "listening", "thinking", "curious", "surprised"]);

// Moods that breathe gently while nothing else is happening.
const BREATHING = new Set(["neutral", "listening", "curious", "thinking"]);

// A still pose for some moods: a head tilt, or a sleepy droop.
const POSES = {
  listening: "tilt-in",
  curious: "tilt-out",
  sympathetic: "tilt-in",
  shy: "tilt-in",
  sleepy: "droop",
  asleep: "droop",
};

// Moods with rosy cheeks.
const CHEEKY = new Set(["happy", "celebrating", "shy"]);

// How far the eyes and the face move towards what Smiley is looking at, in
// drawing units. The face moves a little and the eyes a little more, which
// reads as Smiley turning its head.
const FACE_TRAVEL = { x: 0.9, y: 0.6 };
const EYE_TRAVEL = { x: 3.2, y: 2 };

const LEFT_EYE = "translate(25 37)";
const RIGHT_EYE = "translate(39 37)";

/** One eye, drawn around 0,0. The right eye is the left one mirrored. */
function Eye({ mood, side }) {
  const mirror = side === "right" ? "scale(-1 1)" : undefined;

  switch (mood) {
    case "happy":
    case "celebrating":
      return <path className="smiley__line" d="M-3.4 1.4 Q0 -4.2 3.4 1.4" />;
    case "asleep":
      return <path className="smiley__line" d="M-3.3 -0.6 Q0 3 3.3 -0.6" />;
    case "dizzy":
      return (
        <path
          className="smiley__line smiley__line--thin"
          transform={mirror}
          d="M0 0 m-0.6 0 a0.6 0.6 0 1 1 1.2 0 a1.8 1.8 0 1 1 -3.6 0 a3 3 0 1 1 6 0"
        />
      );
    case "sleepy":
      return <path className="smiley__eye" d="M-3.3 0.4 H3.3 A3.3 2.6 0 0 1 -3.3 0.4 Z" />;
    case "sympathetic":
      return (
        <g transform={mirror}>
          <ellipse className="smiley__eye" cy="0.6" rx="3.2" ry="4.2" />
          {/* Brows up in the middle: "oh no, that's a shame". */}
          <path className="smiley__line smiley__line--thin" d="M-3.8 -6 L3 -8.2" />
        </g>
      );
    case "surprised":
      return (
        <g>
          <ellipse className="smiley__eye" rx="4" ry="5.2" />
          <path className="smiley__line smiley__line--thin" d="M-3.4 -8.4 Q0 -10.8 3.4 -8.4" />
        </g>
      );
    case "curious":
      return (
        <g>
          <ellipse className="smiley__eye" rx="3.7" ry="5.1" />
          {/* One brow up, the other not: "ooh, what's this?" */}
          {side === "left" && (
            <path className="smiley__line smiley__line--thin" d="M-3.4 -8 Q0 -10.2 3.4 -8.2" />
          )}
        </g>
      );
    case "thinking":
      return (
        <g>
          <ellipse className="smiley__eye" rx="3.3" ry="4.5" />
          {side === "right" && (
            <path className="smiley__line smiley__line--thin" d="M-3.2 -7.8 Q0 -9.8 3.2 -7.8" />
          )}
        </g>
      );
    case "shy":
      // Small eyes looking down and away: "oh, you're still looking at me".
      return <ellipse className="smiley__eye" cx="1.4" cy="1.8" rx="2.6" ry="3.4" />;
    default:
      return <ellipse className="smiley__eye" rx="3.3" ry="4.5" />;
  }
}

/** The mouth, drawn in place on the face. */
function Mouth({ mood, talking }) {
  if (talking) {
    return <ellipse className="smiley__fill smiley__mouth--talk" cx="32" cy="46.5" rx="3" ry="2.4" />;
  }

  switch (mood) {
    case "happy":
      return <path className="smiley__fill" d="M25 44 Q32 53 39 44 Z" />;
    case "celebrating":
      return <path className="smiley__fill" d="M23.5 43.5 Q32 55 40.5 43.5 Z" />;
    case "curious":
      return <ellipse className="smiley__fill" cx="32" cy="46.6" rx="1.8" ry="2" />;
    case "surprised":
      return <ellipse className="smiley__fill" cx="32" cy="46.8" rx="2.6" ry="3.2" />;
    case "listening":
      return <path className="smiley__smile" d="M28 45.6 Q32 48.4 36 45.6" />;
    case "thinking":
      return <path className="smiley__smile" d="M28.5 46.5 Q31.5 45.2 35.5 46" />;
    case "sympathetic":
      return <path className="smiley__smile" d="M29 46.2 Q32 47.8 35 46.2" />;
    case "sleepy":
      return <ellipse className="smiley__fill smiley__mouth--yawn" cx="32" cy="46.5" rx="1.6" ry="1.2" />;
    case "asleep":
      return <path className="smiley__smile" d="M29.5 46 Q32 47.6 34.5 46" />;
    case "dizzy":
      return <path className="smiley__smile" d="M26 46 Q28.5 44 31 46 Q33.5 48 36 46 Q37 45 38 45.4" />;
    case "shy":
      return <path className="smiley__smile" d="M29.5 46.3 Q32 48 34.5 46.3" />;
    default:
      // The smile. Symmetric, round-ended, and inside the face: a smile, not a logo.
      return <path className="smiley__smile" d="M26.5 45 Q32 50 37.5 45" />;
  }
}

/**
 * Seasonal hats (see seasonalOutfit in useSmiley.js), in the two brand
 * colours and paper only. They sit over the top of the hood; the aerial is
 * tucked away underneath while one is on.
 */
function Hat({ outfit }) {
  switch (outfit) {
    case "bobble":
      return (
        <g className="smiley__hat">
          <path className="smiley__hat-body" d="M13 20 C13 10 21 5 32 5 C43 5 51 10 51 20 Z" />
          <rect className="smiley__hat-trim" x="11.5" y="16.5" width="41" height="5.5" rx="2.75" />
          <circle className="smiley__hat-trim" cx="32" cy="4.5" r="3.4" />
        </g>
      );
    case "witch":
      return (
        <g className="smiley__hat">
          <path className="smiley__hat-body" d="M21 15.5 L33 -7 Q35 -9 37.5 -6 L35 -3 L42 15.5 Z" />
          <rect className="smiley__hat-trim" x="22" y="11" width="20" height="3.5" />
          <ellipse className="smiley__hat-body" cx="32" cy="16" rx="23" ry="3.6" />
        </g>
      );
    case "party":
      return (
        <g className="smiley__hat">
          <path className="smiley__hat-trim" d="M24 15 L32 -4 L40 15 Z" />
          <path className="smiley__hat-stripe" d="M27.2 7.5 L36.8 7.5 M29.2 2.5 L34.8 2.5" />
          <circle className="smiley__hat-pom" cx="32" cy="-4.5" r="2.6" />
        </g>
      );
    case "gradcap":
      return (
        <g className="smiley__hat">
          <path className="smiley__hat-body" d="M20 11 V17 Q32 21.5 44 17 V11 Z" />
          <path className="smiley__hat-body" d="M10 9 L32 2 L54 9 L32 16 Z" />
          <path className="smiley__hat-tassel" d="M32 9 L50 11.5 V20" />
          <circle className="smiley__hat-trim" cx="50" cy="21" r="1.8" />
        </g>
      );
    default:
      return null;
  }
}

const SmileyFace = forwardRef(function SmileyFace(
  {
    mood = "neutral",
    look = { x: 0, y: 0 },
    blink = false,
    talking = false,
    motion = null,
    motionKey = 0,
    antenna = null,
    antennaKey = 0,
    outfit = null,
    still = false,
    size = 64,
    grounded = false,
    className = "",
  },
  ref,
) {
  // React's ids contain characters that can break a url(#...) reference.
  const clipId = `smiley-face-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const pose = POSES[mood];
  const breathing = !still && BREATHING.has(mood);
  const blinking = blink && !still && OPEN_EYED.has(mood);
  const aerial = mood === "thinking" ? "flash" : antenna;

  const shift = (travel) => ({
    transform: `translate(${look.x * travel.x}px, ${look.y * travel.y}px)`,
  });

  return (
    <svg
      ref={ref}
      className={`smiley${still ? " smiley--still" : ""}${className ? ` ${className}` : ""}`}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <ellipse cx="32" cy="39" rx="17" ry="14.5" />
        </clipPath>
      </defs>

      {/* A flat shadow, so Smiley stands on the page instead of floating. */}
      {grounded && <ellipse className="smiley__shadow" cx="32" cy="61.2" rx="19" ry="2" />}

      {/* One-off movements (a hop, a bounce, a sway) restart when the key changes. */}
      <g key={motionKey} className={motion && !still ? `smiley__move smiley__move--${motion}` : "smiley__move"}>
        <g className={`smiley__body${breathing ? " smiley__body--breathe" : ""}`}>
          <g className={`smiley__pose${pose ? ` smiley__pose--${pose}` : ""}`}>
            {/* The T aerial, for T-Levels. Drawn first so the hood covers its root. */}
            {!outfit && (
              <g
                key={antennaKey}
                className={`smiley__aerial${aerial && !still ? ` smiley__aerial--${aerial}` : ""}`}
              >
                {/* Drawn twice, dark edge then orange core, like the hood, so it
                    shows on a light page and a dark one. */}
                <path className="smiley__stem-edge" d="M32 13 Q31.4 8.5 32 4.4" />
                <path className="smiley__stem" d="M32 13 Q31.4 8.5 32 4.4" />
                <path
                  className="smiley__t"
                  d="M28.4 1.8 H35.6 Q37 1.8 37 3.1 Q37 4.4 35.6 4.4 H28.4 Q27 4.4 27 3.1 Q27 1.8 28.4 1.8 Z"
                />
              </g>
            )}

            {/* The hood: a round head that tucks in under the face, then
                shoulders. Not a pointed hood with a curl, which is Echo's. */}
            <path
              className="smiley__hood"
              d="M32 11 C45 11 53 21 53 33 C53 40 51 45 51.5 48 C52 53 56 56 58.5 58.5 Q59.5 61 57 61 L7 61 Q4.5 61 5.5 58.5 C8 56 12 53 12.5 48 C13 45 11 40 11 33 C11 21 19 11 32 11 Z"
            />

            {/* The fold of the hood around the face. */}
            <ellipse className="smiley__rim" cx="32" cy="34.5" rx="18.8" ry="16.2" />

            <Hat outfit={outfit} />

            {/* The face is drawn centred at y 39; this lifts it up into the
                head. A separate group, because the look-around movement below
                is a CSS transform, which would replace an SVG one. */}
            <g transform="translate(0 -4.5)">
              <g className="smiley__turn" style={shift(FACE_TRAVEL)}>
                <ellipse className="smiley__face" cx="32" cy="39" rx="17" ry="14.5" />

                <g clipPath={`url(#${clipId})`}>
                  {CHEEKY.has(mood) && (
                    <g className="smiley__cheeks">
                      <ellipse cx="19.5" cy="44.5" rx="2.4" ry="1.3" />
                      <ellipse cx="44.5" cy="44.5" rx="2.4" ry="1.3" />
                    </g>
                  )}

                  <g className="smiley__turn" style={shift(EYE_TRAVEL)}>
                    <g className={`smiley__eyes${blinking ? " smiley__eyes--shut" : ""}`}>
                      <g transform={LEFT_EYE}>
                        <Eye mood={mood} side="left" />
                      </g>
                      <g transform={RIGHT_EYE}>
                        <Eye mood={mood} side="right" />
                      </g>
                    </g>
                  </g>

                  <Mouth mood={mood} talking={talking} />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>

      {mood === "asleep" && (
        <g className="smiley__zs">
          <text x="48" y="15" fontSize="8">z</text>
          <text x="55" y="7" fontSize="6">z</text>
        </g>
      )}
    </svg>
  );
});

export default SmileyFace;
