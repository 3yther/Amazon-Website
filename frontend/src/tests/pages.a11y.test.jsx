import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import About from "../pages/About.jsx";
import Help from "../pages/Help.jsx";
import TLevelsAtAmazon from "../pages/TLevelsAtAmazon.jsx";
import { FAQS } from "../aboutContent.js";
import { expectNoAxeViolations } from "./axe.js";

// Automated WCAG 2.2 AA checks on the three information pages, the same
// engine Lighthouse uses. Each page is wrapped in <main>, the way App.jsx
// shows it, so landmarks are checked as a visitor meets them.
function renderPage(Page) {
  return render(
    <MemoryRouter>
      <main>
        <Page />
      </main>
    </MemoryRouter>,
  );
}

const PAGES = [
  ["About", About],
  ["T-Levels at Amazon", TLevelsAtAmazon],
  ["Help", Help],
];

describe("Accessibility of the information pages", () => {
  it.each(PAGES)("%s has no WCAG 2.2 AA problems axe can find", async (_name, Page) => {
    const { container } = renderPage(Page);
    await expectNoAxeViolations(container);
  });

  it.each(PAGES)("%s has exactly one h1", (_name, Page) => {
    renderPage(Page);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("About still passes with an FAQ answer open and a quiz error showing", async () => {
    // The page changes as people use it, so check it in a used state too.
    const user = userEvent.setup();
    const { container } = renderPage(About);

    await user.click(screen.getByRole("button", { name: FAQS[0].question }));
    await user.click(screen.getByRole("button", { name: "See my result" }));

    await expectNoAxeViolations(container);
  });
});
