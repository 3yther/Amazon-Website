import axe from "axe-core";

// NEW CONCEPT: axe-core is the accessibility engine inside Lighthouse. Given
// some rendered HTML, it reports anything that breaks a WCAG rule, such as a
// button with no name, a broken aria-controls, or headings that skip a level.

// Only the WCAG 2.2 A and AA rules, because that is the target we claim.
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Runs axe over an element and fails the test with a readable list if it
 * finds anything.
 *
 * Colour contrast is switched off here because jsdom does not draw the page,
 * so it cannot measure colours. Contrast is checked by hand in a real browser.
 */
export async function expectNoAxeViolations(element) {
  const results = await axe.run(element, {
    runOnly: { type: "tag", values: WCAG_22_AA },
    rules: { "color-contrast": { enabled: false } },
  });

  const problems = results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help}\n` +
      violation.nodes.map((node) => `  at ${node.target.join(" ")}`).join("\n"),
  );

  if (problems.length > 0) {
    throw new Error(`Accessibility problems found:\n\n${problems.join("\n\n")}`);
  }
}
