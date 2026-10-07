import { test as setup } from "./fixtures";
import globalSetup from "./globalSetup";

setup("authenticate", async ({ mainPage, product, version, config }) => {
  setup.setTimeout(120_000);
  const filename = `tests/e2e/playwright/.auth/user-${product}-v${version}.json`;
  await globalSetup(product)(config);
  const context = await mainPage.login();
  if (context === null) {
    return;
  }

  await context.storageState({ path: filename });
});
