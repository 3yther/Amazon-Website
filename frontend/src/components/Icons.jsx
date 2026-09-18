// SVG line icons. Decorative, so hidden from screen readers; the text next to
// each icon carries the meaning.

function Icon({ children }) {
  return (
    <svg
      className="icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <Icon>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function LockIcon() {
  return (
    <Icon>
      <rect x="5" y="11" width="14" height="10" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  );
}

export function AlertIcon() {
  return (
    <Icon>
      <path d="M12 3 2 21h20L12 3z" />
      <path d="M12 10v5M12 18v.01" />
    </Icon>
  );
}
