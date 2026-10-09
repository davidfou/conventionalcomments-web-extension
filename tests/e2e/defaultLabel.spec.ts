import { test, expect } from "./fixtures";

test("Uses the default label chosen in the popup without reloading the page", async ({
  context,
  extensionId,
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await mainPage.clearLocalStorage();
  await mainPage.navigateToChangesPage();

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  const select = popup.getByLabel("Default label");
  await expect(select).toBeEnabled();
  await select.selectOption("question");
  await expect(select).toBeEnabled();
  await popup.close();

  await page.bringToFront();
  const container = await mainPage.openNewThread();
  await expect(container.locator("textarea")).toHaveValue("**question:** ");
});
