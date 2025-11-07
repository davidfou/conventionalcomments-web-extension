import { test } from "./fixtures";

test.beforeAll(async ({ mainPage }) => {
  await mainPage.removeAllThreads();
});

test("visual testing", async ({ page, mainPage }) => {
  const themes = await mainPage.getAvailableThemes();
  test.setTimeout(60_000 * themes.length);
  for (const theme of themes) {
    await mainPage.selectTheme(theme);

    await mainPage.clearLocalStorage();
    await mainPage.goToMainPage();

    await mainPage.openNewThread();
    await page.mouse.move(10, 10);

    await mainPage.makeScreenshotAssertion(theme, "editor-active", false);

    await page
      .getByTestId("label-combobox")
      .getByTestId("combobox-toggle")
      .click();
    await page
      .getByTestId("combobox-item")
      .and(page.locator('[data-testvalue="none"]'))
      .click();
    await mainPage.makeScreenshotAssertion(theme, "editor-inactive", false);

    await page
      .getByTestId("label-combobox")
      .getByTestId("combobox-toggle")
      .click();
    await page
      .getByTestId("combobox-item")
      .and(page.locator('[data-testvalue="suggestion"]'))
      .hover({ position: { x: 10, y: 10 } });
    await mainPage.makeScreenshotAssertion(theme, "label-selector", true);

    await page.keyboard.press("Enter");
    await page
      .getByTestId("decorations-combobox")
      .getByTestId("combobox-toggle")
      .click();
    await page
      .getByTestId("combobox-item")
      .and(page.locator('[data-testvalue="blocking"]'))
      .click();
    await page
      .getByTestId("decorations-combobox")
      .getByTestId("combobox-toggle")
      .click();
    await page
      .getByTestId("combobox-item")
      .and(page.locator('[data-testvalue="if-minor"]'))
      .click();

    await page
      .getByTestId("label-combobox")
      .getByTestId("combobox-toggle")
      .hover();
    await mainPage.makeScreenshotAssertion(theme, "mouse-hover-label", false);

    await page
      .getByTestId("decorations-combobox")
      .getByTestId("combobox-toggle")
      .hover();
    await mainPage.makeScreenshotAssertion(
      theme,
      "mouse-hover-decorations",
      false,
    );

    await page
      .getByTestId("combobox-badge")
      .and(page.locator('[data-testvalue="if-minor"]'))
      .getByTestId("combobox-badge-clear")
      .hover();
    await mainPage.makeScreenshotAssertion(
      theme,
      "mouse-hover-decorations-clear-button",
      false,
    );

    await page
      .getByTestId("label-combobox")
      .getByTestId("combobox-toggle")
      .click();
    await page.keyboard.type("unknown");
    await mainPage.makeScreenshotAssertion(
      theme,
      "label-empty-search-results",
      true,
    );

    await page.keyboard.press("Escape");

    await page
      .getByTestId("decorations-combobox")
      .getByTestId("combobox-toggle")
      .click();

    await page.keyboard.type("unknown");

    await mainPage.makeScreenshotAssertion(
      theme,
      "decorations-empty-search-results",
      true,
    );
  }
});
