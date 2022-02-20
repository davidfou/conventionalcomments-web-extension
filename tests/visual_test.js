const assert = require("assert");
const config = require("config");

Feature("Visual");

const themes = config.get(
  `codeceptjs.${config.get("codeceptjs.product")}.themes`
);

BeforeSuite(({ I }) => {
  I.removeAllThreads();
});

Before(async ({ MainPage }) => {
  await MainPage.login();
});

Scenario("the list of themes is complete", async ({ MainPage }) => {
  const extractedThemes = await MainPage.getThemes();
  assert.deepStrictEqual(extractedThemes, themes);
});

const availableThemes = new DataTable(["theme"]);
themes.forEach((theme) => {
  availableThemes.add([theme]);
});

const screenshotNames = [
  "editor-active",
  "editor-inactive",
  "label-selector",
  "label-selector-mouse-hover",
  "decorator-selector-mouse-hover-clear",
];

const allScreenshots = new DataTable(["theme", "screenshotName"]);
themes.forEach((theme) => {
  screenshotNames.forEach((screenshotName) => {
    allScreenshots.add([theme, screenshotName]);
  });
});

const getScreenshotName = (theme, name) =>
  `${theme.replaceAll(/\W+/g, "-")}-${name}.png`;

Data(availableThemes).Scenario(
  "take screenshots",
  async ({ I, MainPage, current }) => {
    await MainPage.selectTheme(current.theme);

    I.say("the plugin is well integrated visually when active");
    MainPage.goToMainPage();
    MainPage.waitPageIsReady();
    I.injectStyleBeforeScreenshot();
    I.clearLocalStorage();
    MainPage.openNewThread();
    I.moveCursorTo("body", 10, 10);
    I.saveElementScreenshot(
      MainPage.getNewCommentEditorSelector().withDescendant("$toggle-button"),
      getScreenshotName(current.theme, screenshotNames[0])
    );

    I.say("the plugin is well integrated visually when inactive");
    MainPage.goToMainPage();
    MainPage.waitPageIsReady();
    I.injectStyleBeforeScreenshot();
    I.clearLocalStorage();
    MainPage.openNewThread();
    I.click("$toggle-button");
    I.moveCursorTo("body", 10, 10);
    I.saveElementScreenshot(
      MainPage.getNewCommentEditorSelector().withDescendant("$toggle-button"),
      getScreenshotName(current.theme, screenshotNames[1])
    );

    I.say("the label selector is well integrated visually");
    MainPage.goToMainPage();
    MainPage.waitPageIsReady();
    I.injectStyleBeforeScreenshot();
    I.clearLocalStorage();
    MainPage.openNewThread();
    I.click("$label-selector");
    I.moveCursorTo("$option-suggestion", 10, 10);
    I.saveElementScreenshot(
      MainPage.getNewCommentEditorSelector().withDescendant("$toggle-button"),
      getScreenshotName(current.theme, screenshotNames[2])
    );

    I.say(
      "the decorator with the mouse on the label is well integrated visually"
    );
    MainPage.goToMainPage();
    MainPage.waitPageIsReady();
    I.injectStyleBeforeScreenshot();
    I.clearLocalStorage();
    MainPage.openNewThread();
    I.click("$decoration-selector");
    I.click("$option-blocking");
    I.click("$decoration-selector");
    I.click("$option-if-minor");
    I.moveCursorTo(locate(".multiSelectItem_label").first(), 10, 10);
    I.saveElementScreenshot(
      MainPage.getNewCommentEditorSelector().withDescendant("$toggle-button"),
      getScreenshotName(current.theme, screenshotNames[3])
    );

    I.say(
      "the decorator with the mouse on the clear button is well integrated visually"
    );
    MainPage.goToMainPage();
    MainPage.waitPageIsReady();
    I.injectStyleBeforeScreenshot();
    I.clearLocalStorage();
    MainPage.openNewThread();
    I.click("$decoration-selector");
    I.click("$option-blocking");
    I.click("$decoration-selector");
    I.click("$option-if-minor");
    I.moveCursorTo(locate(".multiSelectItem_clear").first(), 10, 10);
    I.saveElementScreenshot(
      MainPage.getNewCommentEditorSelector().withDescendant("$toggle-button"),
      getScreenshotName(current.theme, screenshotNames[4])
    );
  }
);

Data(allScreenshots).Scenario("compare screenshots", ({ I, current }) => {
  I.seeVisualDiff(getScreenshotName(current.theme, current.screenshotName));
});
