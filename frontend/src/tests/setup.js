// Runs before every test file.
import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";

// NEW CONCEPT: jest-dom adds readable checks such as toBeVisible() and
// toHaveAttribute(), so a test reads like a sentence about the page.
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// Removes whatever the last test rendered, so tests never affect each other.
afterEach(() => {
  cleanup();
});
