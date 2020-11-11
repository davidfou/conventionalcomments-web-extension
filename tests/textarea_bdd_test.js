const config = require("config");

Feature("Textarea BDD");

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

Scenario("textarea has focus", ({ I, GitlabPage }) => {
  I.seeElementIsFocused(GitlabPage.getTextareaSelector());
});

Scenario(
  "textarea is initialized with the expected value",
  ({ I, GitlabPage }) => {
    I.seeInField(GitlabPage.getTextareaSelector(), "**praise:** ");
  }
);

Scenario("selecting controlled text brings cursor to the start", ({ I }) => {
  I.type("my comment");
  I.setSelectionRange(0, 6);
  I.seeSelectedText(12, 12);
});

Scenario(
  "selecting controlled text and part of the comment selects only the comment part",
  ({ I }) => {
    I.type("my comment");
    I.setSelectionRange(5, 16);
    I.seeSelectedText(12, 16);
  }
);

Scenario("using left key works cannot reaches the controlled part", ({ I }) => {
  I.type("my");
  I.seeSelectedText(14, 14);
  I.pressKey("ArrowLeft");
  I.seeSelectedText(13, 13);
  I.pressKey("ArrowLeft");
  I.seeSelectedText(12, 12);
  I.pressKey("ArrowLeft");
  I.seeSelectedText(12, 12);
});

Scenario("using up key cannot reaches the controlled part", ({ I }) => {
  I.type("my");
  I.seeSelectedText(14, 14);
  I.pressKey("ArrowUp");
  I.seeSelectedText(12, 12);
  I.pressKey("ArrowDown");
  I.seeSelectedText(14, 14);
  I.type("\nline");
  I.seeSelectedText(19, 19);
  I.pressKey("ArrowUp");
  I.seeSelectedText(12, 12);
});
