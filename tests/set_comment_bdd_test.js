const config = require("config");

Feature("Set comment BDD");

BeforeSuite(async ({ I, login }) => {
  await login("gitlab");
  await I.removeAllThreads();
});

Before(({ I, GitlabPage }) => {
  I.amOnPage(config.get("codeceptjs.gitlab.mainPage"));
  GitlabPage.waitPageIsReady();
  I.clearLocalStorage();
  GitlabPage.openNewThread();
});

Scenario("another label can be selected", ({ I, GitlabPage }) => {
  I.click(locate("$label-selector").find("input"));
  I.type("nitpick");
  I.pressKey("Enter");

  I.seeInField(GitlabPage.getTextareaSelector(), "**nitpick:** ");
});

Scenario("one decoration can be added", ({ I, GitlabPage }) => {
  I.click(locate("$decoration-selector").find("input"));
  I.type("if-minor");
  I.pressKey("Enter");

  I.seeInField(GitlabPage.getTextareaSelector(), "**praise (if-minor):** ");
});

Scenario("two decorations can be added", ({ I, GitlabPage }) => {
  I.click(locate("$decoration-selector").find("input"));
  I.type("if-minor");
  I.pressKey("Enter");

  I.click(locate("$decoration-selector").find("input"));
  I.type("non-blocking");
  I.pressKey("Enter");

  I.seeInField(
    GitlabPage.getTextareaSelector(),
    "**praise (if-minor, non-blocking):** "
  );
});

Scenario("two decorations can be cleared", ({ I, GitlabPage }) => {
  I.click(locate("$decoration-selector").find("input"));
  I.type("if-minor");
  I.pressKey("Enter");

  I.click(locate("$decoration-selector").find("input"));
  I.type("non-blocking");
  I.pressKey("Enter");

  I.click(locate("$decoration-selector").find(".clearSelect"));

  I.seeInField(GitlabPage.getTextareaSelector(), "**praise:** ");
});

Scenario("one decoration can be cleared", ({ I, GitlabPage }) => {
  I.click(locate("$decoration-selector").find("input"));
  I.type("if-minor");
  I.pressKey("Enter");

  I.click(locate("$decoration-selector").find("input"));
  I.type("non-blocking");
  I.pressKey("Enter");

  I.click(
    locate("$decoration-selector").find(".multiSelectItem_clear").first()
  );

  I.seeInField(GitlabPage.getTextareaSelector(), "**praise (non-blocking):** ");
});

Scenario(
  "the cursor position keeps the same position within the subject",
  ({ I, GitlabPage }) => {
    I.type("my comment");
    I.seeElementIsFocused(GitlabPage.getTextareaSelector());
    I.setSelectionRange(18, 18);

    I.click(locate("$label-selector").find("input"));
    I.type("nitpick");
    I.pressKey("Enter");

    I.seeElementIsFocused(GitlabPage.getTextareaSelector());
    I.seeSelectedText(19, 19);

    I.click(locate("$decoration-selector").find("input"));
    I.type("non-blocking");
    I.pressKey("Enter");

    I.seeElementIsFocused(GitlabPage.getTextareaSelector());
    I.seeSelectedText(34, 34);

    I.click(locate("$decoration-selector").find(".clearSelect"));

    I.seeElementIsFocused(GitlabPage.getTextareaSelector());
    I.seeSelectedText(19, 19);
  }
);
