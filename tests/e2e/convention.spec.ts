import { test, expect } from "./fixtures";

test.beforeAll(async ({ mainPage }) => {
  await mainPage.removeAllThreads();
});

test.beforeEach(async ({ mainPage }) => {
  await mainPage.clearLocalStorage();
});

test("default convention shows the built-in labels", async ({
  page,
  mainPage,
}) => {
  await mainPage.goToMainPage();
  await mainPage.openNewThread();
  await page
    .getByTestId("label-combobox")
    .getByTestId("combobox-toggle")
    .click();

  const options = page.getByTestId("combobox-item");
  await expect
    .soft(options.and(page.locator('[data-testvalue="praise"]')))
    .toBeVisible();
  await expect
    .soft(options.and(page.locator('[data-testvalue="question"]')))
    .toBeVisible();
  await expect
    .soft(options.and(page.locator('[data-testvalue="nitpick"]')))
    .toBeVisible();
  await expect
    .soft(options.and(page.locator('[data-testvalue="spotted"]')))
    .toHaveCount(0);
});

test("a repo with a valid custom convention swaps the labels", async ({
  page,
  mainPage,
}) => {
  await mainPage.goToConventionMainPage("valid");
  await mainPage.openNewThread();

  const editor = page.getByTestId("editor");
  await expect.soft(editor).toHaveAttribute("data-testlabel", "spotted");

  await page
    .getByTestId("label-combobox")
    .getByTestId("combobox-toggle")
    .click();

  const options = page.getByTestId("combobox-item");
  await expect
    .soft(options.and(page.locator('[data-testvalue="spotted"]')))
    .toBeVisible();
  await expect
    .soft(options.and(page.locator('[data-testvalue="approved"]')))
    .toBeVisible();
  await expect
    .soft(options.and(page.locator('[data-testvalue="praise"]')))
    .toHaveCount(0);

  await page.keyboard.press("Escape");

  await page
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  const decorationOptions = page.getByTestId("combobox-item");
  await expect
    .soft(decorationOptions.and(page.locator('[data-testvalue="blocker"]')))
    .toBeVisible();
  await expect
    .soft(
      decorationOptions.and(page.locator('[data-testvalue="non-blocking"]')),
    )
    .toHaveCount(0);
});

test("a repo with an invalid custom convention falls back to the default", async ({
  page,
  mainPage,
}) => {
  await mainPage.goToConventionMainPage("invalid");
  await mainPage.openNewThread();
  await page
    .getByTestId("label-combobox")
    .getByTestId("combobox-toggle")
    .click();

  const options = page.getByTestId("combobox-item");
  await expect
    .soft(options.and(page.locator('[data-testvalue="praise"]')))
    .toBeVisible();
});
