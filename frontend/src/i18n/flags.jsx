import { GlobeIcon } from "../components/Icons.jsx";

// Small flags for the language menu, drawn here so there is nothing to
// download and nothing that depends on emoji (Windows shows emoji flags as
// two letters, like "GB"). Simplified on purpose: at 21 by 14 pixels a flag
// only needs its colours and main shapes to be recognised.
//
// A flag is a visual aid and never carries meaning on its own: the language's
// own name is always written next to it, and screen readers never hear it.

// Points for a five-pointed star, for the Chinese and Pakistani flags.
function star(cx, cy, r, turn = 0) {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.382;
    const angle = ((i * 36 + turn - 90) * Math.PI) / 180;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(" ");
}

const horizontal = (...colours) =>
  colours.map((fill, i) => (
    <rect key={fill + i} x="0" y={(20 / colours.length) * i} width="30" height={20 / colours.length} fill={fill} />
  ));

const vertical = (...colours) =>
  colours.map((fill, i) => (
    <rect key={fill + i} x={(30 / colours.length) * i} y="0" width={30 / colours.length} height="20" fill={fill} />
  ));

// Every flag is drawn on a 30 by 20 box.
const FLAGS = {
  gb: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#ffffff" strokeWidth="4" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#c8102e" strokeWidth="1.4" />
      <path d="M15,0 V20 M0,10 H30" stroke="#ffffff" strokeWidth="6" />
      <path d="M15,0 V20 M0,10 H30" stroke="#c8102e" strokeWidth="3.6" />
    </>
  ),
  pl: horizontal("#ffffff", "#dc143c"),
  ro: vertical("#002b7f", "#fcd116", "#ce1126"),
  in: (
    <>
      {horizontal("#ff9933", "#ffffff", "#138808")}
      <circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" strokeWidth="0.7" />
      <circle cx="15" cy="10" r="0.6" fill="#000080" />
    </>
  ),
  pk: (
    <>
      <rect width="30" height="20" fill="#01411c" />
      <rect width="7.5" height="20" fill="#ffffff" />
      <circle cx="19" cy="10" r="5" fill="#ffffff" />
      <circle cx="20.4" cy="8.9" r="4.2" fill="#01411c" />
      <polygon points={star(22.3, 7.6, 1.7, 20)} fill="#ffffff" />
    </>
  ),
  pt: (
    <>
      <rect width="30" height="20" fill="#ff0000" />
      <rect width="12" height="20" fill="#006600" />
      <circle cx="12" cy="10" r="3.6" fill="#ffcc00" />
      <rect x="10.4" y="8.2" width="3.2" height="3.8" rx="0.4" fill="#ff0000" stroke="#ffffff" strokeWidth="0.5" />
    </>
  ),
  es: (
    <>
      <rect width="30" height="20" fill="#aa151b" />
      <rect y="5" width="30" height="10" fill="#f1bf00" />
    </>
  ),
  bd: (
    <>
      <rect width="30" height="20" fill="#006a4e" />
      <circle cx="13.5" cy="10" r="6" fill="#f42a41" />
    </>
  ),
  cn: (
    <>
      <rect width="30" height="20" fill="#ee1c25" />
      <polygon points={star(5, 5, 3)} fill="#ffff00" />
      <polygon points={star(10, 2, 1, 23)} fill="#ffff00" />
      <polygon points={star(12, 4, 1, 45)} fill="#ffff00" />
      <polygon points={star(12, 7, 1, 0)} fill="#ffff00" />
      <polygon points={star(10, 9, 1, 20)} fill="#ffff00" />
    </>
  ),
  fr: vertical("#002395", "#ffffff", "#ed2939"),
  ru: horizontal("#ffffff", "#0039a6", "#d52b1e"),
  it: vertical("#009246", "#ffffff", "#ce2b37"),
  ng: vertical("#008751", "#ffffff", "#008751"),
  de: horizontal("#000000", "#dd0000", "#ffce00"),
};

/** Country codes that have a drawing here. */
export const FLAG_CODES = Object.keys(FLAGS);

/**
 * The flag for a country code, or the globe for a language with no single
 * country (country is null). Hidden from screen readers either way.
 */
export function Flag({ country }) {
  const drawing = country ? FLAGS[country] : null;
  if (!drawing) {
    return (
      <span className="flag flag--globe" aria-hidden="true">
        <GlobeIcon />
      </span>
    );
  }
  return (
    <svg className="flag" viewBox="0 0 30 20" width="21" height="14" aria-hidden="true" focusable="false">
      {drawing}
    </svg>
  );
}
