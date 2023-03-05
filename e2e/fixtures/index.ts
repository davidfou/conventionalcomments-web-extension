import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "path";

const authFile = "playwright/.auth/user.json";

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use, testInfo) => {
    const pathToExtension = path.join(__dirname, "../../public");
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    if (testInfo.project.name !== "setup") {
      const { cookies } = require("../../playwright/.auth/user.json");
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
});
const { expect } = test;
export { expect, authFile };
