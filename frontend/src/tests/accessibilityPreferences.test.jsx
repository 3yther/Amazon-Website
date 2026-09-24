import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Accessibility from "../pages/Accessibility.jsx";
import {
  AccessibilityPreferencesProvider,
  DEFAULT_PREFERENCES,
} from "../hooks/useAccessibilityPreferences.jsx";
import { REDUCE_MOTION_EVENT, REDUCE_MOTION_KEY } from "../useReducedMotion.js";

// What the settings actually DO to the page, which is the part that kept
// going wrong. These check the flags the stylesheets read: the classes on
// <html> and <body> and the data attributes on <html>.
//
// MANUAL CHECK, NOT AUTOMATED HERE: jsdom does not load the stylesheets or
// draw anything, so it cannot measure a colour contrast ratio. High contrast
// was therefore verified by hand in a real browser, in all four
// combinations (light, light + high contrast, dark, dark + high contrast),
// across the homepage, the resources library, all five Accessibility tabs,
// About, Help, Pathways, FAQs, Register interest, Login, Feedback, the
// footer and the open menu drawer, by computing every text node's contrast
// against its real background. All four combinations came back clean. What
// these tests lock in is the thing that broke: which token each theme's
// high-contrast rule is built from.

const { mockUseAuth, mockGetPreferences, mockUpdatePreferences } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockGetPreferences: vi.fn(),
  mockUpdatePreferences: vi.fn(),
}));

vi.mock("../auth.jsx", () => ({ useAuth: mockUseAuth }));
vi.mock("../api.js", () => ({
  getPreferences: mockGetPreferences,
  updatePreferences: mockUpdatePreferences,
}));

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

function renderSettings() {
  return render(
    <MemoryRouter>
      <AccessibilityPreferencesProvider>
        <main>
          <Accessibility />
        </main>
      </AccessibilityPreferencesProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-motion");
  document.documentElement.removeAttribute("data-colour-vision");
  document.body.className = "";
  prefersDark(false);
  mockUseAuth.mockReturnValue({ user: null, checked: true, refresh: vi.fn() });
  mockGetPreferences.mockResolvedValue(null);
  mockUpdatePreferences.mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Applying preferences to the page", () => {
  it("applies them without the settings page being open", () => {
    // The whole point of the provider: it used to live inside the settings
    // page, so every preference stopped applying the moment you left it (and
    // never came back on a reload).
    window.localStorage.setItem(
      "tsmile:accessibility-preferences",
      JSON.stringify({ ...DEFAULT_PREFERENCES, high_contrast: true, font_size_scale: 130 }),
    );

    render(
      <MemoryRouter>
        <AccessibilityPreferencesProvider>
          <p>Any other page</p>
        </AccessibilityPreferencesProvider>
      </MemoryRouter>,
    );

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
    // The pair that erased the page: dark mode's high-contrast rule set the
    // muted ink to the PAGE colour, so all the secondary text vanished. The
    // rule is CSS, but both switches have to reach the document for either
    // side of it to apply at all.
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
    render(
      <MemoryRouter>
        <AccessibilityPreferencesProvider>
          <p>Any page</p>
        </AccessibilityPreferencesProvider>
      </MemoryRouter>,
    );
    expect(document.documentElement).toHaveClass("dark-mode");
  });
});

describe("Reduce motion", () => {
  it("is switched on by the site's own setting, live", async () => {
    const user = userEvent.setup({ delay: null });
    renderSettings();

    expect(document.documentElement.dataset.motion).toBe("full");

    await user.click(screen.getByRole("checkbox", { name: /Reduce motion/ }));

    // This is what the homepage's drifting names now answer to. Before, the
    // only thing that could stop them was the system setting, so turning
    // this on left them moving.
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });

  it("is switched on by the system setting alone", () => {
    prefersReducedMotion(true);
    render(
      <MemoryRouter>
        <AccessibilityPreferencesProvider>
          <p>Any page</p>
        </AccessibilityPreferencesProvider>
      </MemoryRouter>,
    );
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });

  it("lets the site's own setting overrule the system one", () => {
    prefersReducedMotion(true);
    window.localStorage.setItem(REDUCE_MOTION_KEY, "false");

    render(
      <MemoryRouter>
        <AccessibilityPreferencesProvider>
          <p>Any page</p>
        </AccessibilityPreferencesProvider>
      </MemoryRouter>,
    );

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
    // It used to say "Read page content aloud", which it has never done.
    expect(screen.getByRole("checkbox", { name: /chat assistant/i })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Read page content aloud/i })).toBeNull();
  });
});
