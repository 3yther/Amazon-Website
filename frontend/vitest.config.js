import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

// Settings for the tests (npm test). Kept in its own file so vite.config.js,
// which runs the dev server and the build, is left alone.
//
// NEW CONCEPT: mergeConfig takes everything from vite.config.js (like the React
// plugin, so JSX works in tests) and adds the test settings on top.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // NEW CONCEPT: jsdom is a pretend browser that runs inside Node. It gives
      // the tests a `document` to render React into, without opening Chrome.
      environment: "jsdom",
      // Runs before every test file (see src/tests/setup.js).
      setupFiles: ["./src/tests/setup.js"],
      include: ["src/**/*.test.{js,jsx}"],
      // The default limit is 5 seconds per test. Tests that click through a
      // whole quiz or scan a page with axe can take longer than that on a
      // slower laptop, so they get 30.
      testTimeout: 30000,
    },
  }),
);
