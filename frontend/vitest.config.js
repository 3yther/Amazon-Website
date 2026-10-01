import { readdirSync, readFileSync } from "node:fs";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

// Test files that use vi.mock. They get their own fresh jsdom each, because a
// mocked module can clash with the real one when files share (that made the
// Register interest tests fail at random).
const TEST_DIR = "src/tests";
const MOCKING = readdirSync(TEST_DIR)
  .filter((name) => /\.test\.jsx?$/.test(name))
  .filter((name) => readFileSync(`${TEST_DIR}/${name}`, "utf8").includes("vi.mock("))
  .map((name) => `${TEST_DIR}/${name}`);

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
      // 30 seconds per test, because the quiz and axe tests can be slow on older laptops.
      testTimeout: 30000,
      // Worker threads start faster than separate Node processes (forks).
      pool: "threads",
      projects: [
        {
          extends: true,
          test: {
            name: "shared",
            include: ["src/**/*.test.{js,jsx}"],
            exclude: MOCKING,
            // Share one jsdom between these files, which is much faster on
            // Windows. Fine because setup.js clears the page after every test.
            isolate: false,
          },
        },
        {
          extends: true,
          test: {
            name: "isolated",
            include: MOCKING,
            isolate: true,
            // Separate processes, not threads: on a busy Windows laptop a
            // fresh thread for each of these could time out before starting.
            pool: "forks",
          },
        },
      ],
    },
  }),
);
