import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { expectNoAxeViolations } from "./axe.js";

let auth = { user: null, checked: true };
vi.mock("../auth.jsx", () => ({ useAuth: () => auth }));

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

  // The Admin Portal link is for signed-in staff only. It was shown to
  // everybody for a while; a student has no use for a page that sends them
  // straight home, so it is hidden again. The server is what really keeps
  // them out, but there is no reason to offer them the door.
  describe("the Admin Portal link", () => {
    const adminLink = () => footerLinks().find((item) => item.textContent === "Admin Portal");

    it("is shown to Amazon staff", () => {
      auth = { user: { username: "staffer", user_type: "amazon_staff" }, checked: true };
      expect(adminLink()).toHaveAttribute("href", "/admin-portal");
    });

    it.each(["student", "parent", "teacher"])("is hidden from a signed-in %s", (user_type) => {
      auth = { user: { username: "someone", user_type }, checked: true };
      expect(adminLink()).toBeUndefined();
    });

    it("is hidden from somebody who is signed out", () => {
      auth = { user: null, checked: true };
      expect(adminLink()).toBeUndefined();
    });
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
