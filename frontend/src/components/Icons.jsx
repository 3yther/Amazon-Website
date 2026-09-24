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

export function MenuIcon() {
  return (
    <Icon>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function CloseIcon() {
  return (
    <Icon>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function ChevronDownIcon() {
  return (
    <Icon>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

// The show/hide pair on a password field (see TextField in FormFields.jsx).

export function EyeIcon() {
  return (
    <Icon>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon() {
  return (
    <Icon>
      <path d="M4 4l16 16" />
      <path d="M9.5 6.3A9.7 9.7 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.3 3.8" />
      <path d="M6.6 7.6A16.6 16.6 0 0 0 2 12s4 6 10 6a9.6 9.6 0 0 0 3.4-.6" />
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

// One per pathway, for the homepage pathway tiles.

export function DigitalIcon() {
  return (
    <Icon>
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
    </Icon>
  );
}

export function BusinessIcon() {
  return (
    <Icon>
      <rect x="3" y="7" width="18" height="13" />
      <path d="M9 7V4h6v3M3 13h18" />
    </Icon>
  );
}

export function MediaIcon() {
  return (
    <Icon>
      <rect x="3" y="6" width="13" height="12" />
      <path d="M16 10l5-3v10l-5-3" />
    </Icon>
  );
}

export function FinanceIcon() {
  return (
    <Icon>
      <path d="M4 20h16M7 16v-4M12 16V7M17 16v-7" />
    </Icon>
  );
}

export function EngineeringIcon() {
  return (
    <Icon>
      <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}
