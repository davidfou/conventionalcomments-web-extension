Feature("Navigation BDD");

BeforeSuite(({ I }) => {
  I.removeAllThreads();
});

Before(async ({ MainPage }) => {
  await MainPage.login();
});

Scenario(
  "Plugin is loaded when navigating to the diff page",
  ({ I, MainPage }) => {
    MainPage.goToOverviewPage();
    MainPage.waitPageIsReady();
    I.clearLocalStorage();
    I.click(MainPage.getChangesSelector());
    MainPage.openNewThread();
    I.seeElement("$toggle-button");
  }
);

Scenario("Plugin is not loaded on the overview page", ({ I, MainPage }) => {
  MainPage.goToNewPullRequestPage();
  MainPage.waitPageIsReady();
  I.dontSeeElement("$toggle-button");
});

Scenario(
  "Plugin is not loaded on a new pull request page",
  ({ I, MainPage }) => {
    MainPage.goToNewPullRequestPage();
    MainPage.waitPageIsReady();
    I.dontSeeElement("$toggle-button");
  }
);

Scenario("Plugin is not loaded on a new pull issue page", ({ I, MainPage }) => {
  MainPage.goToNewIssuePage();
  MainPage.waitPageIsReady();
  I.dontSeeElement("$toggle-button");
});
