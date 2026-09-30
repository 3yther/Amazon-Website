import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../auth.jsx";
import { I18nProvider } from "../i18n/I18nProvider.jsx";
import LanguageMenu from "../i18n/LanguageMenu.jsx";
import { LANGUAGES } from "../i18n/languages.js";
import { expectNoAxeViolations } from "./axe.js";

// The language button in the header, the one place to change language apart
// from the Settings page. Fake fetch, same as the other tests (the test files
// share modules).

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

async function openMenu(user) {
  await user.click(screen.getByRole("button", { name: /Choose a language/ }));
  return screen.getByRole("list");
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
  document.documentElement.lang = "en-GB";
  document.documentElement.dir = "ltr";
});

describe("Language menu", () => {
  it("shows the current language and opens a list of all eighteen", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    const button = screen.getByRole("button", { name: "Choose a language: English" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("listitem")).toHaveLength(18);
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-current", "true");
  });

  it("names each language in its own words only, with the flag hidden from screen readers", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();
    const list = await openMenu(user);

    for (const language of LANGUAGES) {
      // An exact name: no country, no English name, nothing from the flag.
      const option = within(list).getByRole("button", { name: language.native });
      const flag = option.querySelector(".flag");
      expect(flag, language.code).not.toBeNull();
      expect(flag).toHaveAttribute("aria-hidden", "true");
      expect(option.querySelector(`[lang="${language.htmlLang}"]`)).toHaveTextContent(language.native);
    }
  });

  it("shows a globe for a language with no one flag", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();
    const list = await openMenu(user);

    expect(within(list).getByRole("button", { name: "العربية" }).querySelector(".flag--globe")).not.toBeNull();
    expect(within(list).getByRole("button", { name: "Polski" }).querySelector("svg.flag")).not.toBeNull();
  });

  it("changes the language and closes", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);
    await user.click(screen.getByRole("button", { name: "Polski" }));

    expect(screen.queryByRole("list")).toBeNull();
    expect(document.documentElement.lang).toBe("pl");
  });

  it.each([
    ["中文（普通话）", "zh", "zh-Hans", "ltr"],
    ["Yorùbá", "yo", "yo", "ltr"],
    ["العربية", "ar", "ar", "rtl"],
  ])("choosing %s sets the page's lang and direction and remembers it", async (native, code, htmlLang, dir) => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);
    await user.click(screen.getByRole("button", { name: native }));

    expect(document.documentElement.lang).toBe(htmlLang);
    expect(document.documentElement.dir).toBe(dir);
    expect(window.localStorage.getItem("tsmile:language")).toBe(code);
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

  it("works from the keyboard: arrows open it on the current language and move through the list", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();
    const button = screen.getByRole("button", { name: /Choose a language/ });
    const first = LANGUAGES[0].native;
    const last = LANGUAGES.at(-1).native;

    button.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: first })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: LANGUAGES[1].native })).toHaveFocus();

    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: last })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: first })).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("button", { name: last })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: first })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.queryByRole("list")).toBeNull();
    expect(button).toHaveFocus();
  });

  it("has no accessibility problems axe can find when open", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderMenu();
    await openMenu(user);
    await expectNoAxeViolations(container);
  });
});
