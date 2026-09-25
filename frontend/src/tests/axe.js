import axe from "axe-core";

// axe-core checks rendered HTML for WCAG problems (it's what Lighthouse uses).

// Only the WCAG 2.2 A and AA rules, because that is the target we claim.
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Runs axe and fails the test with a list of problems.
// Colour contrast is off because jsdom can't draw the page, so we check that by hand.
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
