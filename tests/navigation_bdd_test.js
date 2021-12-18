Feature("Navigation BDD");

BeforeSuite(({ I }) => {
  I.removeAllThreads();
});

Before(async ({ I, MainPage }) => {
  await MainPage.login();
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
