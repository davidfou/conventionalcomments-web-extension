Feature("Navigation BDD");

BeforeSuite(({ I, MainPage }) => {
  MainPage.login();
  I.removeAllThreads();
});

Before(({ I, MainPage }) => {
  MainPage.goToOverviewPage();
  MainPage.waitPageIsReady();
  I.clearLocalStorage();
});

Scenario(
  "Plugin is loaded when navigating to the diff page",
  ({ I, MainPage }) => {
    I.click(MainPage.getChangesSelector());
    MainPage.openNewThread();
    I.seeElement("$toggle-button");
  }
);
