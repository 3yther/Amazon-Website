// Picture icons for the About, T-Levels at Amazon and Help pages, so the pages
// are easier to follow if reading is hard. The content files pick one by name
// (e.g. icon: "book"). Hidden from screen readers because the text says the same.

const PATHS = {
  book: (
    <>
      <path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3z" />
      <path d="M21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" />
      <path d="M9 7V4h6v3M3 13h18" />
    </>
  ),
  signpost: (
    <>
      <path d="M12 3v18M8 21h8" />
      <path d="M5 6h11l3 2.5-3 2.5H5z" />
    </>
  ),
  tools: (
    <>
      <path d="M4 20l9.6-9.6" />
      <path d="M12.9 4.1l7 7-2.8 2.8-7-7z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-5h4v5" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 8.5A2.5 2.5 0 0 0 10 10v6M8 12.5h5M8 16h8" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12h.01" />
    </>
  ),
  gradcap: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6" />
    </>
  ),
  split: (
    <path d="M12 21v-8M12 13L6 7M12 13l6-6M6 7h4M6 7v4M18 7h-4M18 7v4" />
  ),
  arrows: (
    <>
      <path d="M3 12h17M10 12l9-7M10 12l9 7" />
      <path d="M18 9l3 3-3 3M15 5h4v4M15 19h4v-4" />
    </>
  ),
  tag: (
    <>
      <path d="M3 3h9l9 9-9 9-9-9z" />
      <path d="M8 8h.01" />
    </>
  ),
  bus: (
    <>
      <rect x="5" y="3" width="14" height="15" />
      <path d="M5 11h14M8 18v3M16 18v3M8 15h.01M16 15h.01" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7v.5M12 17h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  heart: <path d="M12 20l-8-8a4.5 4.5 0 0 1 8-4.5A4.5 4.5 0 0 1 20 12z" />,
  chat: <path d="M4 5h16v11H10l-6 4z" />,
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" />
      <path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  phone: (
    <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
  ),
  pen: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13 7l4 4" />
    </>
  ),
  mappin: (
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5M9 12h7M9 16h7" />
    </>
  ),
  folder: <path d="M3 6h6l2 2h10v12H3z" />,
  video: (
    <>
      <rect x="3" y="5" width="18" height="14" />
      <path d="M10 9v6l5-3z" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M16 7l3 3M14 9l2 2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7h.01" />
    </>
  ),
};

/** The picture names the content files are allowed to use. */
export const PICTOGRAM_NAMES = Object.keys(PATHS);

/** One picture on an orange tile. `size` is "small" in lists, default in cards. */
export default function Pictogram({ name, size }) {
  const drawing = PATHS[name];
  if (!drawing) return null;

  return (
    <span className={size === "small" ? "pictogram pictogram--small" : "pictogram"} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        focusable="false"
      >
        {drawing}
      </svg>
    </span>
  );
}
