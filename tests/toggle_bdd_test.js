Feature("Toggle BDD");

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

Scenario("removes label and decoration selects", ({ I }) => {
  I.seeElement(locate("$label-selector").find("input"));
  I.seeElement(locate("$decoration-selector").find("input"));

  I.click("$toggle-button");

  I.dontSeeElement(locate("$label-selector").find("input"));
  I.dontSeeElement(locate("$decoration-selector").find("input"));
});

Scenario("cursor keeps the same position", ({ I, MainPage }) => {
  I.type("my comment");
  I.setSelectionRange(18, 18);

  I.click("$toggle-button");
  I.seeElementIsFocused(MainPage.getTextareaSelector());
  I.seeSelectedText(18, 18);
});

Scenario("allows user to select all the text", ({ I }) => {
  I.type("my comment");
  I.pressKey(["Control", "A"]);
  I.seeSelectedText(12, 22);

  I.click("$toggle-button");
  I.pressKey(["Control", "A"]);
  I.seeSelectedText(0, 22);
});

Scenario(
  "prepends default label with empty string (reactivation)",
  ({ I, MainPage }) => {
    I.click("$toggle-button");
    I.pressKey(["Control", "A"]);
    I.pressKey("Backspace");

    I.click("$toggle-button");
    I.seeInField(MainPage.getTextareaSelector(), "**praise:** ");
  }
);

Scenario(
  "prepends default label with subject (reactivation)",
  ({ I, MainPage }) => {
    I.click("$toggle-button");
    I.pressKey(["Control", "A"]);
    I.pressKey("Backspace");
    I.type("my comment");

    I.click("$toggle-button");
    I.seeInField(MainPage.getTextareaSelector(), "**praise:** my comment");
  }
);

Scenario(
  "keeps valid label and decoration (reactivation)",
  ({ I, MainPage }) => {
    I.click("$toggle-button");
    I.pressKey(["Control", "A"]);
    I.pressKey("Backspace");
    I.type("**nitpick (non-blocking):** my comment");

    I.click("$toggle-button");
    I.seeInField(
      MainPage.getTextareaSelector(),
      "**nitpick (non-blocking):** my comment"
    );
  }
);

Scenario("keeps cursor position on subject (reactivation)", ({ I }) => {
  I.click("$toggle-button");
  I.pressKey(["Control", "A"]);
  I.pressKey("Backspace");
  I.type("my comment");
  I.setSelectionRange(6, 6);

  I.click("$toggle-button");
  I.seeSelectedText(18, 18);
});

Scenario("updates selected text (reactivation)", ({ I }) => {
  I.click("$toggle-button");
  I.pressKey(["Control", "A"]);
  I.pressKey("Backspace");
  I.type("**nitpick (non-blocking):** my comment");
  I.pressKey(["Control", "A"]);

  I.click("$toggle-button");
  I.seeSelectedText(28, 38);
});
