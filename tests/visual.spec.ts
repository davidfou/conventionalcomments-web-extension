import { test, expect } from "./fixtures";

test.beforeEach(async ({ mainPage }) => {
  await mainPage.removeAllThreads();
});

test("visual testing", async ({ page, mainPage }) => {
  const themes = await mainPage.getAvailableThemes();
  test.setTimeout(30_000 * themes.length);
  for (const theme of themes) {
    await mainPage.selectTheme(theme);

    await mainPage.goToMainPage();
    await mainPage.clearLocalStorage();
    await mainPage.injectStyleBeforeScreenshot();
    await mainPage.openNewThread();
    await page.mouse.move(10, 10);
    expect
      .soft(
        await mainPage.newCommentEditorSelector.screenshot(),
        "the plugin is well integrated when active"
      )
      .toMatchSnapshot([mainPage.product, theme, "editor-active.png"]);

    await mainPage.goToMainPage();
    await mainPage.clearLocalStorage();
    await mainPage.injectStyleBeforeScreenshot();
    await mainPage.openNewThread();
    await page.getByTestId("toggle-button").click();
    await page.mouse.move(10, 10);
    expect
      .soft(
        await mainPage.newCommentEditorSelector.screenshot(),
        "the plugin is well integrated when inactive"
      )
      .toMatchSnapshot([mainPage.product, theme, "editor-inactive.png"]);

    await mainPage.goToMainPage();
    await mainPage.clearLocalStorage();
    await mainPage.injectStyleBeforeScreenshot();
    await mainPage.openNewThread();
    await page.getByTestId("label-selector").click();
    await page
      .getByTestId("option-suggestion")
      .hover({ position: { x: 10, y: 10 } });
    expect
      .soft(
        await mainPage.newCommentEditorSelector.screenshot(),
        "the label selector is well integrated"
      )
      .toMatchSnapshot([mainPage.product, theme, "label-selector.png"]);

    await mainPage.goToMainPage();
    await mainPage.clearLocalStorage();
    await mainPage.injectStyleBeforeScreenshot();
    await mainPage.openNewThread();
    await page.getByTestId("decoration-selector").click();
    await page.getByTestId("option-blocking").click();
    await page.getByTestId("decoration-selector").click();
    await page.getByTestId("option-if-minor").click();
    await page
      .locator(".multiSelectItem_label")
      .first()
      .hover({ position: { x: 10, y: 10 } });
    expect
      .soft(
        await mainPage.newCommentEditorSelector.screenshot(),
        "the decorator with the mouse on the label is well integrated"
      )
      .toMatchSnapshot([
        mainPage.product,
        theme,
        "decorator-selector-mouse-hover.png",
      ]);

    await mainPage.goToMainPage();
    await mainPage.clearLocalStorage();
    await mainPage.injectStyleBeforeScreenshot();
    await mainPage.openNewThread();
    await page.getByTestId("decoration-selector").click();
    await page.getByTestId("option-blocking").click();
    await page.getByTestId("decoration-selector").click();
    await page.getByTestId("option-if-minor").click();
    await page
      .locator(".multiSelectItem_clear")
      .first()
      .hover({ position: { x: 10, y: 10 } });
    expect
      .soft(
        await mainPage.newCommentEditorSelector.screenshot(),
        "the decorator with the mouse on the clear button is well integrated"
      )
      .toMatchSnapshot([
        mainPage.product,
        theme,
        "decorator-selector-mouse-hover-clear",
      ]);

    await mainPage.goToMainPage();
    await mainPage.clearLocalStorage();
    await mainPage.injectStyleBeforeScreenshot();
    await mainPage.openNewThread();
    await page.getByTestId("decoration-selector").click();
    await page.getByTestId("option-blocking").click();
    await page.getByTestId("decoration-selector").click();
    await page.getByTestId("option-if-minor").click();
    await page
      .getByTestId("decoration-selector")
      .locator(".clearSelect")
      .hover({ position: { x: 10, y: 10 } });
    expect
      .soft(
        await mainPage.newCommentEditorSelector.screenshot(),
        "the mouse on the clear all button is well integrated"
      )
      .toMatchSnapshot([
        mainPage.product,
        theme,
        "decorator-clear-all-mouse-hover",
      ]);
  }
});
