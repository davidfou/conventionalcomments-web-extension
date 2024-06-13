import config from "config";
import {
  expect,
  defineConfig,
  Locator,
  PlaywrightTestConfig,
} from "@playwright/test";
import type { MyOptions } from "./tests/fixtures";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

expect.extend({
  async toHaveSelectedText(locator: Locator, start: number, end: number) {
    const result = await locator.evaluate(
      (
        node
      ):
        | { success: false }
        | {
            success: true;
            start: number;
            end: number;
          } => {
        if (!(node instanceof HTMLTextAreaElement)) {
          return { success: false };
        }
        return {
          success: true,
          start: node.selectionStart,
          end: node.selectionEnd,
        };
      }
    );
    if (!result.success) {
      return {
        pass: false,
        message: () => "the selector is not a textarea",
      };
    }
    const pass = start === result.start && end === result.end;
    return {
      pass,
      message: () =>
        pass
          ? `expected selection not to be (${start}, ${end})`
          : `expected selection to be (${start}, ${end}), got (${result.start}, ${result.end})`,
    };
  },
});

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<MyOptions>({
  testDir: "./tests",
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: config.get("playwright.reporter"),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    testIdAttribute: "data-qa",
  },

  /* Configure projects for major browsers */
  projects: (["github", "gitlab"] as const).flatMap(
    (product): PlaywrightTestConfig<MyOptions>["projects"] => [
      {
        name: `setup-${product}`,
        testMatch: /.*\.setup\.ts/,
        use: { isSetup: true, product },
      },
      {
        name: product,
        dependencies: [`setup-${product}`],
        use: { product },
      },
    ]
  ),

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
});
