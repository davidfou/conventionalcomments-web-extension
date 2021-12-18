Feature("Visual");

BeforeSuite(({ I }) => {
  I.removeAllThreads();
});

Before(async ({ I, MainPage }) => {
  await MainPage.login();
  MainPage.goToMainPage();
  MainPage.waitPageIsReady();
  I.clearLocalStorage();
  MainPage.openNewThread();
});

Scenario(
  "the plugin is well integrated visually when active",
  ({ I, MainPage }) => {
    const screenshotName = "editor-active.png";
    I.saveElementScreenshot(
      MainPage.getNewCommentEditorSelector().withDescendant("$toggle-button"),
      screenshotName
    );
    I.seeVisualDiff(screenshotName);
  }
);

Scenario(
  "the plugin is well integrated visually when inactive",
  ({ I, MainPage }) => {
    I.click("$toggle-button");
    I.moveCursorTo("body");
    const screenshotName = "editor-inactive.png";
    I.saveElementScreenshot(
      MainPage.getNewCommentEditorSelector().withDescendant("$toggle-button"),
      screenshotName
    );
    I.seeVisualDiff(screenshotName);
  }
);

Scenario(
  "the label selector is well integrated visually",
  ({ I, MainPage }) => {
    I.click("$label-selector");
    I.moveCursorTo("$option-suggestion");
    const screenshotName = "label-selector.png";
    I.saveElementScreenshot(
      locate(
        MainPage.getNewCommentEditorSelector().withDescendant("$toggle-button")
      )
        .find("$label-selector")
        .find(".listContainer"),
      screenshotName
    );
    I.seeVisualDiff(screenshotName);
  }
);

Scenario(
  "the decorator with the mouse on the label is well integrated visually",
  ({ I, MainPage }) => {
    I.click("$decoration-selector");
    I.click("$option-blocking");
    I.click("$decoration-selector");
    I.click("$option-if-minor");
    I.moveCursorTo(locate(".multiSelectItem_label").first());
    const screenshotName = "decorator-selector-label.png";
    I.saveElementScreenshot(
      locate(
        MainPage.getNewCommentEditorSelector().withDescendant("$toggle-button")
      ).find("$decoration-selector"),
      screenshotName
    );
    I.seeVisualDiff(screenshotName);
  }
);

Scenario(
  "the decorator with the mouse on the mouse on the clear button is well integrated visually",
  ({ I, MainPage }) => {
    I.click("$decoration-selector");
    I.click("$option-blocking");
    I.click("$decoration-selector");
    I.click("$option-if-minor");
    I.moveCursorTo(locate(".multiSelectItem_clear").first());
    const screenshotName = "decorator-selector-clear.png";
    I.saveElementScreenshot(
      locate(
        MainPage.getNewCommentEditorSelector().withDescendant("$toggle-button")
      ).find("$decoration-selector"),
      screenshotName
    );
    I.seeVisualDiff(screenshotName);
  }
);
