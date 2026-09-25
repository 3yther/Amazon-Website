import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

// Test settings (npm test). mergeConfig adds these on top of vite.config.js.
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
      // 30 seconds per test, because the quiz and axe tests can be slow on older laptops.
      testTimeout: 30000,
      // Share one jsdom between test files, which is much faster on Windows.
      // Fine because setup.js clears the page after every test.
      isolate: false,
      // Worker threads start faster than separate Node processes (forks).
      pool: "threads",
    },
  }),
);
