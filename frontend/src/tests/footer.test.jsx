import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { expectNoAxeViolations } from "./axe.js";

// The footer is on every page, so a broken or misleading link there is
// broken everywhere.

/** The route paths in App.jsx, e.g. <Route path="/help" ...>. */
function appRoutes() {
  // Tests run from the frontend folder, so the path is relative to that.
  const app = readFileSync("src/App.jsx", "utf8");
  return [...app.matchAll(/<Route path="([^"*]+)"/g)].map((match) => match[1]);
}

function footerLinks() {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Footer />
    </MemoryRouter>,
  );
  return screen.getAllByRole("link");
}

describe("Footer", () => {
  it("only links to pages that exist", () => {
    const routes = appRoutes();
    for (const link of footerLinks()) {
      const href = link.getAttribute("href");
      const path = href.split("?")[0]; // "/accessibility?tab=account" is the /accessibility route
      expect(routes, `no route for ${href} ("${link.textContent}")`).toContain(path);
    }
  });

  it("never sends two links to the same page", () => {
    // Several links all pointing at the homepage was how placeholder links
    // hid: they looked fine but went nowhere useful.
    const hrefs = footerLinks().map((link) => link.getAttribute("href"));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("marks only one link as the current page", () => {
    const current = footerLinks().filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
  });

  it("has no WCAG 2.2 AA problems axe can find", async () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    await expectNoAxeViolations(container);
  });
});
