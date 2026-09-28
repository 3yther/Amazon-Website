import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { AuthProvider } from "../auth.jsx";
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

/**
 * The footer signed in as somebody. fetch is stubbed rather than auth.jsx
 * mocked, because a module mock here took the real module away from other
 * test files when the whole suite ran.
 */
function renderAs(user) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) =>
      String(url).endsWith("/api/accounts/me/")
        ? Response.json(user ?? { detail: "no" }, { status: user ? 200 : 401 })
        : Response.json({}, { status: 404 }),
    ),
  );
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <Footer />
      </AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  // The Admin Portal link is the one link here that is not for everybody, so
  // the rules above are re-run with it present rather than relaxed for it.
  describe("the staff-only Admin Portal link", () => {
    it("is not there for a visitor who is not signed in", async () => {
      renderAs(null);

      await waitFor(() => expect(screen.getAllByRole("link").length).toBeGreaterThan(0));
      expect(screen.queryByRole("link", { name: "Admin Portal" })).not.toBeInTheDocument();
    });

    it("is not there for a student", async () => {
      renderAs({ id: 2, username: "ada", user_type: "student" });

      await waitFor(() => expect(screen.getAllByRole("link").length).toBeGreaterThan(0));
      expect(screen.queryByRole("link", { name: "Admin Portal" })).not.toBeInTheDocument();
    });

    it("is there for staff, and goes to a real page", async () => {
      renderAs({ id: 1, username: "staffer", user_type: "amazon_staff" });

      const link = await screen.findByRole("link", { name: "Admin Portal" });
      expect(link).toHaveAttribute("href", "/admin-portal");
      expect(appRoutes()).toContain("/admin-portal");
    });

    it("does not duplicate a page the footer already links to", async () => {
      renderAs({ id: 1, username: "staffer", user_type: "amazon_staff" });

      await screen.findByRole("link", { name: "Admin Portal" });
      const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
      expect(new Set(hrefs).size).toBe(hrefs.length);
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
