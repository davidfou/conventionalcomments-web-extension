import { test as setup, authFile } from "./fixtures";
import MainPage from "./MainPage";

setup("authenticate", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.login();

  await page.context().storageState({ path: authFile });
});
