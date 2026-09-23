import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import About from "../pages/About.jsx";
import Help from "../pages/Help.jsx";
import TLevelsAtAmazon from "../pages/TLevelsAtAmazon.jsx";

// Checks on the copy and styles against the rules in CONTEXT.md. These are
// quick to break by accident and hard to spot by eye.

// NEW CONCEPT: readFileSync reads a file as plain text. Tests run in Node, so
// they can open the source files themselves and check what is written in them.
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const CONTENT_FILES = ["aboutContent.js", "amazonContent.js", "helpContent.js"];

describe("Content rules", () => {
  it.each(CONTENT_FILES)("%s has no em dashes (CONTEXT.md design rule)", (file) => {
    expect(read(`../${file}`)).not.toContain("\u2014"); // \u2014 is the em dash character
  });

  it.each(CONTENT_FILES)("%s only links to https addresses", (file) => {
    const urls = read(`../${file}`).match(/https?:\/\/[^"'\s]+/g) ?? [];
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("every link inside the site goes to a route that exists", () => {
    // Collect the route paths from App.jsx, e.g. <Route path="/help" ...>.
    const routes = [...read("../App.jsx").matchAll(/<Route path="([^"*]+)"/g)].map(
      (match) => match[1],
    );

    const { container } = render(
      <MemoryRouter>
        <About />
        <TLevelsAtAmazon />
        <Help />
      </MemoryRouter>,
    );

    const internalLinks = [...container.querySelectorAll('a[href^="/"]')].map((link) =>
      link.getAttribute("href").split("#")[0],
    );

    expect(internalLinks.length).toBeGreaterThan(0);
    for (const href of internalLinks) {
      expect(routes, `no route for ${href}`).toContain(href);
    }
  });
});

describe("about.css rules", () => {
  const css = read("../about.css");

  it("does not restyle shared classes, which would leak onto every page", () => {
    // Vite bundles all CSS together, so .label or .section-intro defined here
    // would change them site-wide. They belong to styles.css.
    expect(css).not.toMatch(/^\.label\b/m);
    expect(css).not.toMatch(/^\.section-intro\b/m);
  });

  it("leaves focus rings to the site-wide dark blue rule", () => {
    // An orange ring is about 2:1 on the page colour, too faint for WCAG 2.2.
    expect(css).not.toMatch(/focus-visible\s*\{[^}]*--orange/);
  });

  it("uses colour variables, never hardcoded colours", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });
});
