import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Accessibility from "../pages/Accessibility.jsx";
import {
  AccessibilityPreferencesProvider,
  DEFAULT_PREFERENCES,
} from "../hooks/useAccessibilityPreferences.jsx";
import { AuthProvider } from "../auth.jsx";
import { REDUCE_MOTION_EVENT, REDUCE_MOTION_KEY } from "../useReducedMotion.js";

// Checks the classes and attributes the settings put on <html> and <body>.
// jsdom can't measure colour contrast, so high contrast was checked by hand in
// a browser (light, dark, and both with high contrast).

// Fake fetch instead of vi.mock because the test files share modules (isolate: false).
function fakeServer() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({}, { status: 401 })),
  );
}

function prefersDark(matches) {
  window.matchMedia = (query) => ({
    matches: query.includes("prefers-color-scheme: dark") ? matches : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

function prefersReducedMotion(matches) {
  window.matchMedia = (query) => ({
    matches: query.includes("prefers-reduced-motion") ? matches : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

function renderWith(children) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AccessibilityPreferencesProvider>{children}</AccessibilityPreferencesProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function renderSettings() {
  return renderWith(
    <main>
      <Accessibility />
    </main>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-motion");
  document.documentElement.removeAttribute("data-colour-vision");
  document.body.className = "";
  prefersDark(false);
  fakeServer();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Applying preferences to the page", () => {
  it("applies them without the settings page being open", () => {
    // The settings need to apply on every page, not just the settings page.
    window.localStorage.setItem(
      "tsmile:accessibility-preferences",
      JSON.stringify({ ...DEFAULT_PREFERENCES, high_contrast: true, font_size_scale: 130 }),
    );

    renderWith(<p>Any other page</p>);

    expect(document.body).toHaveClass("high-contrast");
    expect(document.documentElement.style.getPropertyValue("--font-scale")).toBe("1.3");
  });

  it("marks the theme on <html> so the stylesheet can pick a side", async () => {
    const user = userEvent.setup({ delay: null });
    renderSettings();

    await user.click(screen.getByRole("tab", { name: "Display" }));
    await user.selectOptions(screen.getByLabelText("Theme"), "dark");

    expect(document.documentElement).toHaveClass("dark-mode");
    expect(document.documentElement).not.toHaveClass("light-mode");

    await user.selectOptions(screen.getByLabelText("Theme"), "light");
    expect(document.documentElement).toHaveClass("light-mode");
    expect(document.documentElement).not.toHaveClass("dark-mode");
  });

  it("puts high contrast and the theme on at the same time", async () => {
    // Dark mode with high contrast once hid all the grey text, so check both get applied.
    const user = userEvent.setup({ delay: null });
    renderSettings();

    await user.click(screen.getByRole("checkbox", { name: /High contrast/ }));
    expect(document.body).toHaveClass("high-contrast");

    await user.click(screen.getByRole("tab", { name: "Display" }));
    await user.selectOptions(screen.getByLabelText("Theme"), "dark");

    expect(document.documentElement).toHaveClass("dark-mode");
    expect(document.body).toHaveClass("high-contrast");
  });

  it("names the colour-vision filter on <html>, and takes it off again", async () => {
    const user = userEvent.setup({ delay: null });
    renderSettings();

    const select = screen.getByLabelText("Colour blindness type");
    await user.selectOptions(select, "deuteranopia");
    expect(document.documentElement.dataset.colourVision).toBe("deuteranopia");

    await user.selectOptions(select, "none");
    expect(document.documentElement.dataset.colourVision).toBeUndefined();
  });

  it("follows the system theme when the choice is Match system", () => {
    prefersDark(true);
    renderWith(<p>Any page</p>);
    expect(document.documentElement).toHaveClass("dark-mode");
  });
});

describe("Reduce motion", () => {
  it("is switched on by the site's own setting, live", async () => {
    const user = userEvent.setup({ delay: null });
    renderSettings();

    expect(document.documentElement.dataset.motion).toBe("full");

    await user.click(screen.getByRole("checkbox", { name: /Reduce motion/ }));

    // The homepage floating names should stop when this is on.
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });

  it("is switched on by the system setting alone", () => {
    prefersReducedMotion(true);
    renderWith(<p>Any page</p>);
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });

  it("lets the site's own setting overrule the system one", () => {
    prefersReducedMotion(true);
    window.localStorage.setItem(REDUCE_MOTION_KEY, "false");

    renderWith(<p>Any page</p>);

    expect(document.documentElement.dataset.motion).toBe("full");
  });

  it("is stored where every other animation already looks for it", async () => {
    const user = userEvent.setup({ delay: null });
    const heard = vi.fn();
    window.addEventListener(REDUCE_MOTION_EVENT, heard);
    renderSettings();

    await user.click(screen.getByRole("checkbox", { name: /Reduce motion/ }));

    expect(window.localStorage.getItem(REDUCE_MOTION_KEY)).toBe("true");
    expect(heard).toHaveBeenCalled();
    window.removeEventListener(REDUCE_MOTION_EVENT, heard);
  });
});

describe("Saying what the settings actually do", () => {
  it("describes text to speech as the chat assistant only", () => {
    renderSettings();
    // It only reads the chat, so it shouldn't say it reads the page.
    expect(screen.getByRole("checkbox", { name: /chat assistant/i })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Read page content aloud/i })).toBeNull();
  });
});
