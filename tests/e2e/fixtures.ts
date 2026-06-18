import type { MainPage } from "./MainPage";
import type { BrowserContext } from "playwright";
import type { Config } from "./config";
import {
  test as baseTest,
  expect as baseExpect,
  chromium,
} from "@playwright/test";
import { extendExpect } from "../commonMatchers";
import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "./config";
import getMainPage from "./MainPage";
import { Product } from "./types";

export type MyOptions = {
  product: Product;
  version: number;
};

type MyFixtures = {
  context: BrowserContext;
  extensionId: string;
  config: Config;
  mainPage: MainPage;
};
export const test = baseTest.extend<MyOptions & MyFixtures>({
  product: ["github", { option: true }],
  version: [1, { option: true }],
  config: async ({ product, version }, use): Promise<void> => {
    await use(getConfig(product, version));
  },
  mainPage: async ({ page, product, version, config }, use) => {
    await use(getMainPage(page, product, version, config));
  },
  context: async ({ product, version, config }, use) => {
    const pathToExtension = path.join(
      import.meta.dirname,
      `../../.output/chrome-mv3${process.env.CI ? "" : "-dev"}/`,
    );
    await fs.access(path.join(pathToExtension, "manifest.json")).catch(() => {
      throw new Error(
        `Extension build not found at ${pathToExtension}. Run \`npm run ${process.env.CI ? "build" : "dev"}\` before running the e2e tests.`,
      );
    });
    const context = await chromium.launchPersistentContext("", {
      baseURL: config.baseUrl,
      channel: "chromium",
      recordVideo: {
        dir: path.join(import.meta.dirname, "../../playwright-videos"),
      },
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    const content = await fs
      .readFile(
        path.join(
          import.meta.dirname,
          `./playwright/.auth/user-${product}-v${version}.json`,
        ),
        "utf8",
      )
      .catch((error) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
        return null;
      });
    if (content !== null) {
      const { cookies } = JSON.parse(content);
      context.addCookies(cookies);
    }

    if (product === "gitlab" && version === 2) {
      await context.addCookies([
        {
          name: "rapid_diffs_enabled",
          value: "true",
          domain: ".gitlab.com",
          path: "/",
          secure: true,
          sameSite: "Lax",
        },
      ]);
    }

    // Temporary workaround to bypass the modal to present the new GitLab interface
    if (product === "gitlab") {
      const page = await context.newPage();
      await page.goto("https://gitlab.com/");
      await page.evaluate(() => {
        localStorage.setItem("showDapWelcomeModal", "false");
      });
      await page.close();
    }

    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (background !== undefined) {
      background = await context.waitForEvent("serviceworker");
    }

    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
});

export const expect = extendExpect(baseExpect);
