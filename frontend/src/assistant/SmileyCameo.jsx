import { useEffect } from "react";
import SmileyFace from "./SmileyFace.jsx";

// How long a peek lasts: in, a look round, out. Matches the CSS animation.
const PEEK_MS = 3200;

/**
 * Smiley popping its head in from the edge of the screen (an easter egg).
 *
 * edge  "left", "right" or "bottom"
 * spot  how far along that edge, as a percentage
 *
 * Decorative, so hidden from screen readers; the corner button is still the
 * way to open the chat. Clicking the cameo opens it too, as a bonus. Never
 * rendered under reduced motion (see ChatWidget).
 */
export default function SmileyCameo({ edge, spot, outfit, onDone, onOpen }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, PEEK_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  const position = edge === "bottom" ? { "--cameo-x": `${spot}%` } : { "--cameo-y": `${spot}%` };

  return (
    // A button for the pointer, hidden from assistive tech and the tab order,
    // because the corner button already does the same job for everyone.
    <button
      type="button"
      className={`smiley-cameo smiley-cameo--${edge}`}
      style={position}
      onClick={onOpen}
      aria-hidden="true"
      tabIndex={-1}
    >
      <SmileyFace mood="curious" outfit={outfit} size={80} />
    </button>
  );
}
