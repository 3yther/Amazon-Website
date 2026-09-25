import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SiteNav from "../components/SiteNav.jsx";
import { expectNoAxeViolations } from "./axe.js";

// The drawer is pages and nothing else now. Sign up, Login and Log out used
// to sit at the bottom of it, which meant the site answered "am I signed in?"
// in two places, and put logging out one press from every page. All three are
// behind the header's account button instead (AccountDropdown.jsx).

// jsdom has no <dialog> support, so showModal and close are stood in for. The
// drawer's contents are what these tests are about, not the dialog element.
function stubDialog() {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
    };
  }
}

async function openDrawer() {
  stubDialog();
  const user = userEvent.setup({ delay: null });
  render(
    <MemoryRouter>
      <SiteNav />
    </MemoryRouter>,
  );
  await user.click(screen.getByRole("button", { name: "Menu" }));
  return user;
}

describe("The nav drawer", () => {
  it("lists the site's pages, and only those", async () => {
    await openDrawer();

    expect(
      screen.getAllByRole("link").map((link) => link.textContent.trim()),
    ).toEqual([
      "Home",
      "About T-Level",
      "T-Levels at Amazon",
      "T-Level Resources",
      "Find T-Levels Near You",
      "Quiz",
      "Help",
    ]);
  });

  it("no longer offers Log out", async () => {
    await openDrawer();

    expect(screen.queryByRole("button", { name: /log ?out/i })).toBeNull();
    expect(screen.queryByText(/log ?out/i)).toBeNull();
  });

  it("no longer offers Settings", async () => {
    // It is behind the account button, so there is one route to it, not two.
    await openDrawer();

    expect(screen.queryByRole("link", { name: "Settings" })).toBeNull();
    expect(screen.queryByRole("link", { name: /accessibility/i })).toBeNull();
  });

  it("no longer offers Sign up or Login", async () => {
    await openDrawer();

    expect(screen.queryByRole("link", { name: /^sign up$/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /^log ?in$/i })).toBeNull();
  });

  it("calls the finder by its new name, and keeps its address", async () => {
    await openDrawer();

    expect(screen.getByRole("link", { name: "Find T-Levels Near You" })).toHaveAttribute(
      "href",
      "/t-level-near-you",
    );
  });

  it("has no accessibility problems axe can find", async () => {
    await openDrawer();
    await expectNoAxeViolations(document.body);
  });
});
