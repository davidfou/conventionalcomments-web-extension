import { test, expect } from "./fixtures";

test.beforeEach(async ({ mainPage }) => {
  await mainPage.removeAllThreads();
  await mainPage.goToMainPage();
  await mainPage.clearLocalStorage();
  await mainPage.openNewThread();
});

test("textarea has focus", async ({ mainPage }) => {
  await expect(mainPage.textareaLocator).toBeFocused();
});

test("textarea is initialized with the expected value", async ({
  mainPage,
}) => {
  await expect(mainPage.textareaLocator).toHaveValue("**praise:** ");
});

test("selecting controlled text brings cursor to the start", async ({
  page,
  mainPage,
}) => {
  await page.keyboard.type("my comment");
  await mainPage.setSelectionRange(0, 6);
  await expect(mainPage.textareaLocator).toHaveSelectedText(12, 12);
});

test("selecting controlled text and part of the comment selects only the comment part", async ({
  page,
  mainPage,
}) => {
  await page.keyboard.type("my comment");
  await mainPage.setSelectionRange(5, 16);
  await expect(mainPage.textareaLocator).toHaveSelectedText(12, 16);
});

test("using left key works cannot reaches the controlled part", async ({
  page,
  mainPage,
}) => {
  await page.keyboard.type("my");
  await expect(mainPage.textareaLocator).toHaveSelectedText(14, 14);
  await page.keyboard.press("ArrowLeft");
  await expect(mainPage.textareaLocator).toHaveSelectedText(13, 13);
  await page.keyboard.press("ArrowLeft");
  await expect(mainPage.textareaLocator).toHaveSelectedText(12, 12);
  await page.keyboard.press("ArrowLeft");
  await expect(mainPage.textareaLocator).toHaveSelectedText(12, 12);
});

test("using up key cannot reaches the controlled part", async ({
  page,
  mainPage,
}) => {
  await page.keyboard.type("my");
  await expect(mainPage.textareaLocator).toHaveSelectedText(14, 14);
  await page.keyboard.press("ArrowUp");
  await expect(mainPage.textareaLocator).toHaveSelectedText(12, 12);
  await page.keyboard.press("ArrowDown");
  await expect(mainPage.textareaLocator).toHaveSelectedText(14, 14);
  await page.keyboard.type("\nline");
  await expect(mainPage.textareaLocator).toHaveSelectedText(19, 19);
  await page.keyboard.press("ArrowUp");
  await expect(mainPage.textareaLocator).toHaveSelectedText(12, 12);
});
