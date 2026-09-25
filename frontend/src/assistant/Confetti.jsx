import { useEffect, useMemo } from "react";

const PIECES = 36;
const LASTS_MS = 3200;

// Party mode confetti (Konami code easter egg). Decoration only.
export default function Confetti({ onDone }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, index) => ({
        id: index,
        style: {
          "--x": `${Math.random() * 100}%`,
          "--piece": index % 2 ? "var(--orange)" : "var(--paper-dark)",
          "--fall": `${1.6 + Math.random() * 1.2}s`,
          "--delay": `${Math.random() * 0.6}s`,
          "--turn": `${(Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 540)}deg`,
        },
      })),
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(onDone, LASTS_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="smiley-confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span key={piece.id} className="smiley-confetti__piece" style={piece.style} />
      ))}
    </div>
  );
}
