import { defineConfig, devices } from "@playwright/test";
import type { MyOptions } from "./fixtures";
import { projects } from "./types";

const device = {
  ...devices["Desktop Chrome"],
  screen: { width: 2560, height: 1440 },
  viewport: { width: 2200, height: 1200 },
};

export default defineConfig<MyOptions>({
  testDir: "./",
  tsconfig: "../../tsconfig.json",
  snapshotDir: "./__snapshots__",
  timeout: 30 * 1000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : "html",
  use: {
    trace: process.env.CI ? "retain-on-failure" : "off",
    video: process.env.CI ? "retain-on-failure" : "off",
  },
  expect: {
    toHaveScreenshot: {
      pathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
    },
  },
  projects: projects.flatMap(
    ({ product, version }) =>
      [
        {
          name: `setup-${product}-v${version}`,
          testMatch: "**/*.setup.ts",
          use: { ...device, product, version },
        },
        {
          name: `${product}-v${version}`,
          dependencies: [`setup-${product}-v${version}`],
          use: { ...device, product, version },
        },
      ] as const,
  ),
});
