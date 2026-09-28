import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App.jsx";
import { AuthProvider } from "../auth.jsx";

// The brand lockup in the header. Clicking the Amazon logo used to do nothing
// at all, because it was a bare <img> beside the linked wordmark.
//
// fetch is stubbed rather than auth.jsx being mocked: a module mock here took
// the real module away from the other test files when the whole suite ran.

function fakeServer() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      // Nobody signed in, which is a normal answer rather than a failure.
      if (String(url).endsWith("/api/accounts/me/")) {
        return Response.json({ detail: "unauthenticated" }, { status: 401 });
      }
      return Response.json({}, { status: 404 });
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderHeader(path = "/help") {
  fakeServer();
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Site header brand", () => {
  it("takes you home when you click the Amazon logo", () => {
    renderHeader();

    const link = screen.getByAltText("Amazon").closest("a");

    expect(link, "the logo is not inside a link").not.toBeNull();
    expect(link).toHaveAttribute("href", "/");
  });

  it("still takes you home when you click the wordmark", () => {
    renderHeader();

    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("link", { name: "T-SMILE" })).toHaveAttribute("href", "/");
  });

  it("names the logo link for where it goes, not for the picture", () => {
    // The image's own alt says "Amazon", which describes the logo but not the
    // destination, so the link carries its own name. Scoped to the header,
    // because the nav and footer have a "Home" link of their own.
    renderHeader();

    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  });
});

describe("Settings gear", () => {
  it("sits in the header and goes to the settings page", () => {
    renderHeader();

    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/accessibility");
  });

  it("comes just before the account button, so it sits beside it", async () => {
    renderHeader();

    const header = within(screen.getByRole("banner"));
    const gear = header.getByRole("link", { name: "Settings" });
    const account = await header.findByRole("button", { name: "Sign in or sign up" });
    expect(gear.parentElement).toBe(account.closest(".site-header__end"));
    expect(gear.compareDocumentPosition(account) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("says so when you are already on the settings page", () => {
    renderHeader("/accessibility");

    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("link", { name: "Settings" })).toHaveAttribute("aria-current", "page");
  });
});
