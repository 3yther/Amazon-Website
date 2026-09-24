import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AccountDropdown from "../components/AccountDropdown.jsx";
import { AuthProvider } from "../auth.jsx";
import { expectNoAxeViolations } from "./axe.js";

// The header's account button, in both states. Signed in it greets you by
// name; signed out it offers the two ways to get an account, where it used to
// render nothing at all and leave the corner empty.
//
// A fake server rather than a vi.mock of api.js or auth.jsx: these files share
// one module registry (isolate: false in vitest.config.js), so two files
// mocking the same module fight over which version is cached.

const USER = {
  id: 1,
  username: "ada",
  user_type: "student",
  first_name: "Ada",
  last_name: "Lovelace",
};

function signedInAs(user) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      const address = new URL(url, "http://localhost");
      if (address.pathname === "/api/accounts/me/") {
        return user ? Response.json(user) : Response.json({}, { status: 401 });
      }
      return Response.json({}, { status: 404 });
    }),
  );
}

function renderHeader() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AccountDropdown />
      </AuthProvider>
    </MemoryRouter>,
  );
}

/** Waits for the first session check, then opens the menu. */
async function openMenu(name) {
  const user = userEvent.setup({ delay: null });
  await user.click(await screen.findByRole("button", { name }));
  return user;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Signed in", () => {
  it("greets you by your first name", async () => {
    signedInAs(USER);
    renderHeader();

    expect(await screen.findByText("Hello, Ada")).toBeInTheDocument();
  });

  it("falls back to the username when there is no first name", async () => {
    signedInAs({ ...USER, first_name: "", last_name: "" });
    renderHeader();

    expect(await screen.findByText("Hello, ada")).toBeInTheDocument();
  });

  it("opens the same three account links as before", async () => {
    signedInAs(USER);
    renderHeader();
    await openMenu(/Account menu for Ada Lovelace/);

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Profile & Settings",
      "Security Settings",
      "Contact Us",
    ]);
    expect(screen.getByRole("menuitem", { name: "Profile & Settings" })).toHaveAttribute(
      "href",
      "/accessibility",
    );
    expect(screen.getByRole("menuitem", { name: "Security Settings" })).toHaveAttribute(
      "href",
      "/accessibility?tab=security",
    );
  });

  it("still keeps Logout out of the header", async () => {
    // It lives on the Account tab of /accessibility, and only there.
    signedInAs(USER);
    renderHeader();
    await openMenu(/Account menu for Ada Lovelace/);

    expect(screen.queryByText(/log ?out/i)).toBeNull();
  });

  it("shows staff their submissions link", async () => {
    signedInAs({ ...USER, user_type: "amazon_staff" });
    renderHeader();
    await openMenu(/Account menu for Ada Lovelace/);

    expect(screen.getByRole("menuitem", { name: "Submissions" })).toHaveAttribute("href", "/staff");
  });

  it("has no accessibility problems axe can find", async () => {
    signedInAs(USER);
    const { container } = renderHeader();
    await openMenu(/Account menu for Ada Lovelace/);

    await expectNoAxeViolations(container);
  });
});

describe("Signed out", () => {
  it("offers a way in rather than an empty corner", async () => {
    signedInAs(null);
    renderHeader();

    expect(await screen.findByText("Hello, sign in")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in or sign up" })).toBeInTheDocument();
  });

  it("opens a menu with Sign in and a Sign up button", async () => {
    signedInAs(null);
    renderHeader();
    await openMenu("Sign in or sign up");

    expect(screen.getByRole("menuitem", { name: "Sign in" })).toHaveAttribute("href", "/login");

    const signUp = screen.getByRole("menuitem", { name: "Sign up" });
    expect(signUp).toHaveAttribute("href", "/register");
    // Signing up is the one thing here that is a button rather than a row, so
    // it reads as the thing to press.
    expect(signUp).toHaveClass("button", "button--primary");
  });

  it("leaves out the links that need an account", async () => {
    signedInAs(null);
    renderHeader();
    await openMenu("Sign in or sign up");

    for (const label of ["Profile & Settings", "Security Settings", "Submissions"]) {
      expect(screen.queryByRole("menuitem", { name: label })).toBeNull();
    }
    // Contact Us is left out on purpose: the footer carries it on every page.
    expect(screen.queryByRole("menuitem", { name: "Contact Us" })).toBeNull();
  });

  it("has no accessibility problems axe can find", async () => {
    signedInAs(null);
    const { container } = renderHeader();
    await openMenu("Sign in or sign up");

    await expectNoAxeViolations(container);
  });
});

describe("Opening and closing, in either state", () => {
  it.each([
    ["signed in", USER, /Account menu for Ada Lovelace/],
    ["signed out", null, "Sign in or sign up"],
  ])("closes on Escape and gives focus back to the trigger (%s)", async (_name, who, label) => {
    signedInAs(who);
    renderHeader();
    const user = await openMenu(label);

    const trigger = screen.getByRole("button", { name: label });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it.each([
    ["signed in", USER, /Account menu for Ada Lovelace/],
    ["signed out", null, "Sign in or sign up"],
  ])("closes on a click outside it (%s)", async (_name, who, label) => {
    signedInAs(who);
    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountDropdown />
          <p>Somewhere else</p>
        </AuthProvider>
      </MemoryRouter>,
    );
    const user = await openMenu(label);

    await user.click(screen.getByText("Somewhere else"));

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("says nothing until the first session check has answered", () => {
    // Otherwise the button reads "Hello, sign in" for a moment to somebody
    // who is already signed in.
    signedInAs(USER);
    const { container } = renderHeader();

    expect(container.querySelector(".account-menu")).toBeNull();
  });
});
