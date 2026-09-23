import { useEffect, useRef, useState } from "react";

// How far a pupil can travel from the middle, in SVG units.
const EYE_TRAVEL = 2.2;

// The cursor is treated as "far away" past this many pixels, where the eyes
// are already looking as far as they go.
const FAR_AWAY_PX = 260;

/**
 * The assistant's face. Its eyes follow the cursor.
 *
 * BRAND: this is an original character, drawn here in Amazon Orange and Amazon
 * Dark Blue. It is deliberately NOT the Amazon smile with eyes stuck on it:
 * the brief says the smile mark must never be altered, rotated or recoloured,
 * so the mark is left alone and this is its own thing. The mouth is a straight
 * line for the same reason, so it cannot be mistaken for the smile.
 *
 * ACCESSIBILITY: under reduced motion the eyes sit still and no listener is
 * attached at all. The face is decorative, so it is hidden from screen
 * readers; the button around it carries the label.
 */
export default function AssistantMascot({ reducedMotion = false }) {
  const svgRef = useRef(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) {
      setLook({ x: 0, y: 0 });
      return undefined;
    }

    let frame = null;
    let latest = null;

    // mousemove fires far more often than the screen redraws, so the handler
    // only remembers the newest position and the maths happens once per frame.
    const handleMove = (event) => {
      latest = event;
      if (frame !== null) return;

      frame = window.requestAnimationFrame(() => {
        frame = null;
        const svg = svgRef.current;
        if (!svg || !latest) return;

        const box = svg.getBoundingClientRect();
        const fromX = latest.clientX - (box.left + box.width / 2);
        const fromY = latest.clientY - (box.top + box.height / 2);

        const distance = Math.hypot(fromX, fromY);
        if (distance < 1) {
          setLook({ x: 0, y: 0 });
          return;
        }

        // Look towards the cursor, further the further away it is, up to the
        // edge of the eye.
        const reach = Math.min(distance / FAR_AWAY_PX, 1) * EYE_TRAVEL;
        setLook({ x: (fromX / distance) * reach, y: (fromY / distance) * reach });
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <svg
      ref={svgRef}
      className="assistant-mascot"
      viewBox="0 0 48 48"
      width="34"
      height="34"
      aria-hidden="true"
      focusable="false"
    >
      {/* Aerial, so the character reads as a helper rather than a face in a box. */}
      <path d="M24 5v5" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="square" />
      <circle cx="24" cy="4" r="2.5" fill="var(--orange)" />

      <rect x="7" y="10" width="34" height="30" rx="5" fill="var(--blue)" />
      {/* Orange band, the one flash of brand colour on the face. */}
      <rect x="7" y="10" width="34" height="4" rx="2" fill="var(--orange)" />

      <g>
        <circle cx="18" cy="25" r="5" fill="var(--surface)" />
        <circle cx="30" cy="25" r="5" fill="var(--surface)" />
        <circle cx={18 + look.x} cy={25 + look.y} r="2.3" fill="var(--blue)" />
        <circle cx={30 + look.x} cy={25 + look.y} r="2.3" fill="var(--blue)" />
      </g>

      {/* A straight mouth, never a curve or an arrow. */}
      <path d="M18 34h12" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="square" />
    </svg>
  );
}
