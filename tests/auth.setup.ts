import { test as setup } from "./fixtures";
import globalSetup from "./global-setup";

setup("authenticate", async ({ mainPage, product }) => {
  const filename = `playwright/.auth/user-${product}.json`;
  await globalSetup(product)();
  const context = await mainPage.login();
  if (context === null) {
    return;
  }

  await context.storageState({ path: filename });
});
