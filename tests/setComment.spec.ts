import { test, expect } from "./fixtures";

test.beforeEach(async ({ mainPage }) => {
  await mainPage.removeAllThreads();
  await mainPage.goToMainPage();
  await mainPage.clearLocalStorage();
  await mainPage.openNewThread();
});

test("another label can be selected", async ({ page, mainPage }) => {
  await page.getByTestId("label-selector").getByRole("textbox").type("nitpick");
  await page.keyboard.press("Enter");

  await expect(mainPage.textareaLocator).toHaveValue("**nitpick:** ");
});

test("one decoration can be added", async ({ page, mainPage }) => {
  await page
    .getByTestId("decoration-selector")
    .getByRole("textbox")
    .type("if-minor");
  await page.keyboard.press("Enter");

  await expect(mainPage.textareaLocator).toHaveValue("**praise (if-minor):** ");
});

test("two decorations can be added", async ({ page, mainPage }) => {
  await page
    .getByTestId("decoration-selector")
    .getByRole("textbox")
    .type("if-minor");
  await page.keyboard.press("Enter");

  await page
    .getByTestId("decoration-selector")
    .getByRole("textbox")
    .type("non-blocking");
  await page.keyboard.press("Enter");

  await expect(mainPage.textareaLocator).toHaveValue(
    "**praise (if-minor, non-blocking):** "
  );
});

test("two decorations can be cleared", async ({ page, mainPage }) => {
  await page
    .getByTestId("decoration-selector")
    .getByRole("textbox")
    .type("if-minor");
  await page.keyboard.press("Enter");

  await page
    .getByTestId("decoration-selector")
    .getByRole("textbox")
    .type("non-blocking");
  await page.keyboard.press("Enter");

  await page.getByTestId("decoration-selector").locator(".clearSelect").click();

  await expect(mainPage.textareaLocator).toHaveValue("**praise:** ");
});

test("one decoration can be cleared", async ({ page, mainPage }) => {
  await page
    .getByTestId("decoration-selector")
    .getByRole("textbox")
    .type("if-minor");
  await page.keyboard.press("Enter");

  await page
    .getByTestId("decoration-selector")
    .getByRole("textbox")
    .type("non-blocking");
  await page.keyboard.press("Enter");

  await page
    .getByTestId("decoration-selector")
    .locator(".multiSelectItem_clear")
    .first()
    .click();

  await expect(mainPage.textareaLocator).toHaveValue(
    "**praise (non-blocking):** "
  );
});

test("the cursor position keeps the same position within the subject", async ({
  page,
  mainPage,
}) => {
  await page.keyboard.type("my comment");
  await expect(mainPage.textareaLocator).toBeFocused();
  await mainPage.setSelectionRange(18, 18);

  await page.getByTestId("label-selector").getByRole("textbox").click();
  await page.keyboard.type("nitpick");
  await page.keyboard.press("Enter");

  await expect(mainPage.textareaLocator).toBeFocused();
  await mainPage.setSelectionRange(19, 19);

  await page.getByTestId("decoration-selector").getByRole("textbox").click();
  await page.keyboard.type("non-blocking");
  await page.keyboard.press("Enter");

  await expect(mainPage.textareaLocator).toBeFocused();
  await mainPage.setSelectionRange(34, 34);

  await page.getByTestId("decoration-selector").locator(".clearSelect").click();

  await expect(mainPage.textareaLocator).toBeFocused();
  await mainPage.setSelectionRange(19, 19);
});
