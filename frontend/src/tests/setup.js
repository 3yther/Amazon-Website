// Runs before every test file.
import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";

// NEW CONCEPT: jest-dom adds readable checks such as toBeVisible() and
// toHaveAttribute(), so a test reads like a sentence about the page.
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// jsdom does not implement matchMedia, and anything that reads a media query
// in JavaScript (useReducedMotion, the accessibility preferences hook, the
// tab nav's mobile check) calls it while rendering. This stub answers "no"
// to every query, which is the default state: motion allowed, light theme,
// desktop width. A test that needs another answer can override it.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// Removes whatever the last test rendered, so tests never affect each other.
afterEach(() => {
  cleanup();
});
