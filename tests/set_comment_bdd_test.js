Feature("Set comment BDD");

BeforeSuite(({ I, MainPage }) => {
  MainPage.login();
  I.removeAllThreads();
});

Before(({ I, MainPage }) => {
  MainPage.goToMainPage();
  MainPage.waitPageIsReady();
  I.clearLocalStorage();
  MainPage.openNewThread();
});

Scenario("another label can be selected", ({ I, MainPage }) => {
  I.click(locate("$label-selector").find("input"));
  I.type("nitpick");
  I.pressKey("Enter");

  I.seeInField(MainPage.getTextareaSelector(), "**nitpick:** ");
});

Scenario("one decoration can be added", ({ I, MainPage }) => {
  I.click(locate("$decoration-selector").find("input"));
  I.type("if-minor");
  I.pressKey("Enter");

  I.seeInField(MainPage.getTextareaSelector(), "**praise (if-minor):** ");
});

Scenario("two decorations can be added", ({ I, MainPage }) => {
  I.click(locate("$decoration-selector").find("input"));
  I.type("if-minor");
  I.pressKey("Enter");

  I.click(locate("$decoration-selector").find("input"));
  I.type("non-blocking");
  I.pressKey("Enter");

  I.seeInField(
    MainPage.getTextareaSelector(),
    "**praise (if-minor, non-blocking):** "
  );
});

Scenario("two decorations can be cleared", ({ I, MainPage }) => {
  I.click(locate("$decoration-selector").find("input"));
  I.type("if-minor");
  I.pressKey("Enter");

  I.click(locate("$decoration-selector").find("input"));
  I.type("non-blocking");
  I.pressKey("Enter");

  I.click(locate("$decoration-selector").find(".clearSelect"));

  I.seeInField(MainPage.getTextareaSelector(), "**praise:** ");
});

Scenario("one decoration can be cleared", ({ I, MainPage }) => {
  I.click(locate("$decoration-selector").find("input"));
  I.type("if-minor");
  I.pressKey("Enter");

  I.click(locate("$decoration-selector").find("input"));
  I.type("non-blocking");
  I.pressKey("Enter");

  I.click(
    locate("$decoration-selector").find(".multiSelectItem_clear").first()
  );

  I.seeInField(MainPage.getTextareaSelector(), "**praise (non-blocking):** ");
});

Scenario(
  "the cursor position keeps the same position within the subject",
  ({ I, MainPage }) => {
    I.type("my comment");
    I.seeElementIsFocused(MainPage.getTextareaSelector());
    I.setSelectionRange(18, 18);

    I.click(locate("$label-selector").find("input"));
    I.type("nitpick");
    I.pressKey("Enter");

    I.seeElementIsFocused(MainPage.getTextareaSelector());
    I.seeSelectedText(19, 19);

    I.click(locate("$decoration-selector").find("input"));
    I.type("non-blocking");
    I.pressKey("Enter");

    I.seeElementIsFocused(MainPage.getTextareaSelector());
    I.seeSelectedText(34, 34);

    I.click(locate("$decoration-selector").find(".clearSelect"));

    I.seeElementIsFocused(MainPage.getTextareaSelector());
    I.seeSelectedText(19, 19);
  }
);
