import {
  expect,
  defineConfig,
  devices,
} from "@playwright/experimental-ct-react";
import type { Locator } from "@playwright/test";

expect.extend({
  async toHaveSelectedText(locator: Locator, start: number, end: number) {
    await locator.evaluate(
      async () =>
        new Promise((resolve) => window.requestAnimationFrame(resolve)),
    );
    const result = await locator.evaluate(
      (
        node,
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
      },
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
export default defineConfig({
  testMatch: "src_new/**/*.spec.tsx",
  testDir: "./",
  /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
  snapshotDir: "./__snapshots__",
  /* Maximum time one test can run for. */
  timeout: 10 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Port to use for Playwright component endpoint. */
    ctPort: 3100,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
