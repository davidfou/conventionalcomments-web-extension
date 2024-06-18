import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "path";
import fs from "fs/promises";
import config from "config";

import getMainPage, { type MainPage } from "../MainPage";

export type MyOptions = {
  product: "github" | "gitlab";
  isSetup: boolean;
};

type MyFixtures = {
  context: BrowserContext;
  extensionId: string;
  mainPage: MainPage;
};
const test = base.extend<MyOptions & MyFixtures>({
  product: ["github", { option: true }],
  isSetup: [false, { option: true }],
  context: async ({ product }, use) => {
    const pathToExtension = path.join(__dirname, "../../public");
    const context = await chromium.launchPersistentContext("", {
      baseURL: config.get<string>(`e2e.${product}.baseUrl`),
      headless: false,
      recordVideo: {
        dir: path.join(__dirname, "../../playwright-videos"),
      },
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    const content = await fs
      .readFile(
        path.join(__dirname, `../../playwright/.auth/user-${product}.json`),
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
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // for manifest v2:
    let [background] = context.backgroundPages();
    if (!background) background = await context.waitForEvent("backgroundpage");

    /*
    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent("serviceworker");
    */

    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
  mainPage: async ({ page, product }, use) => {
    const mainPage = getMainPage(page, product);
    await use(mainPage);
  },
});
const { expect } = test;
export { test, expect };
