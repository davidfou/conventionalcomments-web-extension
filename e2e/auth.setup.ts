import { test as setup } from "./fixtures";
import globalSetup from "./global-setup";

setup("authenticate", async ({ page, mainPage, product }) => {
  await globalSetup(product)();
  await mainPage.login();

  await page
    .context()
    .storageState({ path: `playwright/.auth/user-${product}.json` });
});
