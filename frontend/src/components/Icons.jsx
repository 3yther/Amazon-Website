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

// A play button, for video resources without a thumbnail.
export function PlayIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l5 3.5-5 3.5z" />
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

// The notifications bell in the header.
export function BellIcon() {
  return (
    <Icon>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function GearIcon() {
  return (
    <Icon>
      <path d="M10.1 4.9L10.4 2.1L13.6 2.1L13.9 4.9L15.7 5.6L17.9 3.9L20.1 6.1L18.4 8.3L19.1 10.1L21.9 10.4L21.9 13.6L19.1 13.9L18.4 15.7L20.1 17.9L17.9 20.1L15.7 18.4L13.9 19.1L13.6 21.9L10.4 21.9L10.1 19.1L8.3 18.4L6.1 20.1L3.9 17.9L5.6 15.7L4.9 13.9L2.1 13.6L2.1 10.4L4.9 10.1L5.6 8.3L3.9 6.1L6.1 3.9L8.3 5.6Z" />
      <circle cx="12" cy="12" r="3" />
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

export function GlobeIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </Icon>
  );
}

export function ThumbUpIcon() {
  return (
    <Icon>
      <path d="M7 11v10H3V11h4zM7 11l4-8c1.7 0 3 1.3 3 3v3h6l-2 12H7" />
    </Icon>
  );
}

export function FlagIcon() {
  return (
    <Icon>
      <path d="M5 21V4h13l-2 4.5 2 4.5H5" />
    </Icon>
  );
}

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

// Used on the account button when nobody is signed in.
export function PersonIcon() {
  return (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </Icon>
  );
}

// One per pathway (see PATHWAY_ICONS at the bottom).

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

// Pathway slug -> icon, so every page uses the same picture for a pathway.
export const PATHWAY_ICONS = {
  digital: DigitalIcon,
  business: BusinessIcon,
  media: MediaIcon,
  finance: FinanceIcon,
  engineering: EngineeringIcon,
};
