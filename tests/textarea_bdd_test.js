Feature("Textarea BDD");

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

Scenario("textarea has focus", ({ I, MainPage }) => {
  I.seeElementIsFocused(MainPage.getTextareaSelector());
});

Scenario(
  "textarea is initialized with the expected value",
  ({ I, MainPage }) => {
    I.seeInField(MainPage.getTextareaSelector(), "**praise:** ");
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
