import fs from "node:fs/promises";
import { test as setup } from "./fixtures";
import globalSetup from "./global-setup";

setup("authenticate", async ({ page, mainPage, product }) => {
  const filename = `playwright/.auth/user-${product}.json`;
  const fileExists = await fs
    .access(filename)
    .then(() => true)
    .catch((error) => {
      if (error.code === "ENOENT") {
        return false;
      }
      throw error;
    });
  if (fileExists) {
    return;
  }
  await globalSetup(product)();
  await mainPage.login();

  await page.context().storageState({ path: filename });
});
