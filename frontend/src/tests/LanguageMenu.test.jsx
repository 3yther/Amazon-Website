import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../auth.jsx";
import { I18nProvider } from "../i18n/I18nProvider.jsx";
import LanguageMenu from "../i18n/LanguageMenu.jsx";
import { expectNoAxeViolations } from "./axe.js";

// The globe button in the header, the one place to change language.
// Fake fetch, same as the other tests (the test files share modules).

function renderMenu() {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({}, { status: 401 })));
  return render(
    <AuthProvider>
      <I18nProvider>
        <LanguageMenu />
      </I18nProvider>
    </AuthProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
  document.documentElement.lang = "en-GB";
  document.documentElement.dir = "ltr";
});

describe("Language menu", () => {
  it("shows the current language and opens a list of all ten", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    const button = screen.getByRole("button", { name: "Choose a language: English" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-current", "true");
  });

  it("changes the language and closes", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await user.click(screen.getByRole("button", { name: /Choose a language/ }));
    await user.click(screen.getByRole("button", { name: "Polski" }));

    expect(screen.queryByRole("list")).toBeNull();
    expect(document.documentElement.lang).toBe("pl");
  });

  it("closes on Escape and puts focus back on the button", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();
    const button = screen.getByRole("button", { name: /Choose a language/ });

    await user.click(button);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("list")).toBeNull();
    expect(button).toHaveFocus();
  });

  it("has no accessibility problems axe can find when open", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderMenu();
    await user.click(screen.getByRole("button", { name: /Choose a language/ }));
    await expectNoAxeViolations(container);
  });
});
