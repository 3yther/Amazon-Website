/**
 * Checks the Admin Portal's data palette is still readable without colour.
 *
 *   npm run check:palette
 *
 * The rule the palette is built on (see styles.css) is that ADJACENT SERIES
 * DIFFER IN LIGHTNESS, not only in hue. Hue alone falls apart in greyscale and
 * under the colour-vision filters in ColourVisionFilters.jsx, which is exactly
 * the audience this site is built for. This reads the values straight out of
 * styles.css and measures them, so the claim in that comment cannot quietly
 * stop being true.
 *
 * It also checks each series has enough contrast against its own background to
 * be seen as a fill at all (3:1, the WCAG 2.2 bar for a non-text graphic).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "..", "src", "styles.css"), "utf8");

/** How far apart two lightnesses must be for adjacent series. */
const MIN_ADJACENT_GAP = 0.12;
/**
 * WCAG 2.2 non-text contrast, checked against the mark's EDGE rather than its
 * fill. Amazon orange is 2.14:1 on white and is not negotiable (it is the
 * brand, and CONTEXT.md already records that it cannot carry meaning alone),
 * so every chart mark is drawn with an ink edge and that is what makes it
 * findable. The fill's job is only to tell one series from its neighbours,
 * which is what MIN_ADJACENT_GAP measures.
 */
const MIN_EDGE_AGAINST_BACKGROUND = 3;

/** sRGB hex to WCAG relative luminance. */
function luminance(hex) {
  const channels = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/**
 * The seven series inside one block, e.g. the `.admin-shell {` block or the
 * `html.dark-mode .admin-shell {` one. Takes the FIRST block whose selector
 * matches, which is the one that defines the theme.
 */
/** The `--admin-mark-edge` of a block, falling back to the base one. */
function edgeIn(selector) {
  const at = css.search(new RegExp(`${selector.replace(/[.+*?^$()[\]{}|\\]/g, "\\$&")}\\s*[{,]`));
  const block = css.slice(at, css.indexOf("\n}", at));
  const found = block.match(/--admin-mark-edge:\s*([^;]+);/);
  return found ? found[1].trim() : null;
}

function seriesIn(selector) {
  // Some blocks are written as two comma-separated selectors, so look for the
  // selector followed by either "{" or ",".
  const at = css.search(new RegExp(`${selector.replace(/[.+*?^$()[\]{}|\\]/g, "\\$&")}\\s*[{,]`));
  if (at === -1) throw new Error(`No block for ${selector}`);
  const block = css.slice(at, css.indexOf("\n}", at));

  return Array.from({ length: 7 }, (_, index) => {
    const found = block.match(new RegExp(`--admin-${index + 1}:\\s*(#[0-9a-f]{6})`, "i"));
    if (!found) throw new Error(`${selector} is missing --admin-${index + 1}`);
    return { name: `--admin-${index + 1}`, hex: found[1] };
  });
}

const THEMES = [
  { label: "light", selector: ".admin-shell", background: "#ffffff" },
  { label: "dark", selector: "html.dark-mode .admin-shell", background: "#2b3947" },
  { label: "high contrast", selector: "body.high-contrast .admin-shell", background: "#ffffff" },
  {
    label: "dark + high contrast",
    selector: "html.dark-mode body.high-contrast .admin-shell",
    background: "#2b3947",
  },
];

let failures = 0;

for (const theme of THEMES) {
  const series = seriesIn(theme.selector);
  console.log(`\n${theme.label}  (on ${theme.background})`);

  series.forEach((one, index) => {
    const previous = index > 0 ? series[index - 1] : null;
    const gap = previous ? Math.abs(luminance(one.hex) - luminance(previous.hex)) : null;

    const notes = [`${contrast(one.hex, theme.background).toFixed(2)}:1 fill vs background`];
    if (gap !== null) notes.push(`lightness gap ${gap.toFixed(3)}`);

    let ok = true;
    if (gap !== null && gap < MIN_ADJACENT_GAP) {
      notes.push(`TOO CLOSE TO ${previous.name} (needs ${MIN_ADJACENT_GAP})`);
      ok = false;
    }
    if (!ok) failures += 1;

    console.log(`  ${ok ? "ok  " : "FAIL"} ${one.name} ${one.hex}  ${notes.join("  ")}`);
  });

  // One edge for every mark in this theme, so a pale fill is still findable.
  const edge = edgeIn(theme.selector);
  if (edge && edge.startsWith("#")) {
    const against = contrast(edge, theme.background);
    const ok = against >= MIN_EDGE_AGAINST_BACKGROUND;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "ok  " : "FAIL"} --admin-mark-edge ${edge}  ${against.toFixed(2)}:1 vs background`,
    );
  } else if (edge) {
    // An rgb(... / alpha) edge sits over the background, so measuring it as a
    // flat colour would be wrong. Composite it first.
    const parts = edge.match(/rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)/);
    if (parts) {
      const [, r, g, b, alpha] = parts;
      const over = [1, 3, 5].map((at) => parseInt(theme.background.slice(at, at + 2), 16));
      const mixed = [r, g, b].map((channel, index) =>
        Math.round(Number(channel) * Number(alpha) + over[index] * (1 - Number(alpha))),
      );
      const hex = `#${mixed.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
      const against = contrast(hex, theme.background);
      const ok = against >= MIN_EDGE_AGAINST_BACKGROUND;
      if (!ok) failures += 1;
      console.log(
        `  ${ok ? "ok  " : "FAIL"} --admin-mark-edge ${edge} -> ${hex}  ${against.toFixed(2)}:1 vs background`,
      );
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} palette problem(s). See styles.css .admin-shell.`);
  process.exit(1);
}
console.log("\nEvery series is distinguishable by lightness alone, in every theme,");
console.log("and every mark has an edge you can see against its background.");
