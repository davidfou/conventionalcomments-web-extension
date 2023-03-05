import { test, expect } from "./fixtures";
import MainPage from "./MainPage";

let mainPage: MainPage;
test.beforeAll(async ({ page }) => {
  mainPage = new MainPage(page);
  await mainPage.removeAllThreads();
  await mainPage.login();
});

test.beforeEach(async () => {
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

test("cursor keeps the same position", async ({ page }) => {
  await page.keyboard.type("my comment");
  await mainPage.setSelectionRange(18, 18);

  await page.getByTestId("toggle-button").click();

  await expect(mainPage.textareaLocator).toBeFocused();
  expect(await mainPage.getSelectedText()).toEqual({ start: 18, end: 18 });
});

test("allows user to select all the text", async ({ page }) => {
  await page.keyboard.type("my comment");
  await page.keyboard.press("Control+A");
  expect(await mainPage.getSelectedText()).toEqual({ start: 12, end: 22 });

  await page.getByTestId("toggle-button").click();
  await page.keyboard.press("Control+A");
  expect(await mainPage.getSelectedText()).toEqual({ start: 0, end: 22 });
});

test("prepends default label with empty string (reactivation)", async ({
  page,
}) => {
  await page.getByTestId("toggle-button").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");

  await page.getByTestId("toggle-button").click();
  await expect(mainPage.textareaLocator).toHaveValue("**praise:** ");
});

test("prepends default label with subject (reactivation)", async ({ page }) => {
  await page.getByTestId("toggle-button").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("my comment");

  await page.getByTestId("toggle-button").click();
  await expect(mainPage.textareaLocator).toHaveValue("**praise:** my comment");
});
