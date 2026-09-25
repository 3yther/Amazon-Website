import { useEffect } from "react";
import SmileyFace from "./SmileyFace.jsx";

// How long a peek lasts: in, a look round, out. Matches the CSS animation.
const PEEK_MS = 3200;

// Smiley peeking in from the edge of the screen (easter egg). Decoration only.
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
