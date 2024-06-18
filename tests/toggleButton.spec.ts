import { test, expect } from "./fixtures";

test.beforeEach(async ({ mainPage }) => {
  await mainPage.removeAllThreads();
  await mainPage.goToMainPage();
  await mainPage.clearLocalStorage();
  await mainPage.openNewThread();
});

test("removes label and decoration selects", async ({ page }) => {
  await expect(page.getByTestId("label-selector")).toBeVisible();
  await expect(page.getByTestId("decoration-selector")).toBeVisible();

  await page.getByTestId("toggle-button").click();

  await expect(page.getByTestId("label-selector")).not.toBeVisible();
  await expect(page.getByTestId("decoration-selector")).not.toBeVisible();
});

test("cursor keeps the same position", async ({ page, mainPage }) => {
  await page.keyboard.type("my comment");
  await mainPage.setSelectionRange(18, 18);

  await page.getByTestId("toggle-button").click();

  await expect(mainPage.textareaLocator).toBeFocused();
  await expect(mainPage.textareaLocator).toHaveSelectedText(18, 18);
});

test("allows user to select all the text", async ({ page, mainPage }) => {
  await page.keyboard.type("my comment");
  await page.keyboard.press("Control+A");
  await expect(mainPage.textareaLocator).toHaveSelectedText(12, 22);

  await page.getByTestId("toggle-button").click();
  await page.keyboard.press("Control+A");
  await expect(mainPage.textareaLocator).toHaveSelectedText(0, 22);
});

test("prepends default label with empty string (reactivation)", async ({
  page,
  mainPage,
}) => {
  await page.getByTestId("toggle-button").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");

  await page.getByTestId("toggle-button").click();
  await expect(mainPage.textareaLocator).toHaveValue("**praise:** ");
});

test("prepends default label with subject (reactivation)", async ({
  page,
  mainPage,
}) => {
  await page.getByTestId("toggle-button").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("my comment");

  await page.getByTestId("toggle-button").click();
  await expect(mainPage.textareaLocator).toHaveValue("**praise:** my comment");
});

test("keeps valid label and decoration (reactivation)", async ({
  page,
  mainPage,
}) => {
  await page.getByTestId("toggle-button").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("**nitpick (non-blocking):** my comment");

  await page.getByTestId("toggle-button").click();
  await expect(mainPage.textareaLocator).toHaveValue(
    "**nitpick (non-blocking):** my comment",
  );
});

test("keeps cursor position on subject (reactivation)", async ({
  page,
  mainPage,
}) => {
  await page.getByTestId("toggle-button").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("my comment");
  await mainPage.setSelectionRange(6, 6);

  await page.getByTestId("toggle-button").click();
  await expect(mainPage.textareaLocator).toHaveSelectedText(18, 18);
});

test("updates selected test (reactivation)", async ({ page, mainPage }) => {
  await page.getByTestId("toggle-button").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("**nitpick (non-blocking):** my comment");
  await page.keyboard.press("Control+A");

  await page.getByTestId("toggle-button").click();
  await expect(mainPage.textareaLocator).toHaveSelectedText(28, 38);
});
