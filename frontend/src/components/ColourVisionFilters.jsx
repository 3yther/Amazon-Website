// SVG filters for the "Colour blindness type" setting. They correct colours
// (daltonisation) instead of simulating the colour blindness.
// Each row of a matrix adds up to 1 so greys stay the same.
// Used from CSS by id (see --colour-vision-filter in styles.css).

const MATRICES = {
  // Red-blind: red and green collapse together, so the difference between
  // them is pushed into green and blue.
  protanopia: [
    1, 0, 0,
    -0.2549, 1.2549, 0,
    0.3031, -0.5451, 1.242,
  ],
  // Green-blind: the same axis, weighted for the green cone instead.
  deuteranopia: [
    1, 0, 0,
    -0.4375, 1.4375, 0,
    0.2625, -0.5625, 1.3,
  ],
  // Blue-blind: blue and yellow collapse, so that difference moves into red
  // and green.
  tritanopia: [
    1.05, -0.3825, 0.3325,
    0, 1.2345, -0.2345,
    0, 0, 1,
  ],
};

/** A 3x3 colour matrix as the 4x5 values feColorMatrix wants. */
function values([r1, r2, r3, g1, g2, g3, b1, b2, b3]) {
  return [
    r1, r2, r3, 0, 0,
    g1, g2, g3, 0, 0,
    b1, b2, b3, 0, 0,
    0, 0, 0, 1, 0,
  ].join(" ");
}

export default function ColourVisionFilters() {
  return (
    <svg
      className="colour-vision-filters"
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
    >
      <defs>
        {Object.entries(MATRICES).map(([type, matrix]) => (
          // sRGB so the colours match the rest of the site
          <filter key={type} id={`colour-vision-${type}`} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={values(matrix)} />
          </filter>
        ))}
      </defs>
    </svg>
  );
}
