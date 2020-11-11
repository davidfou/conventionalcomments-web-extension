const config = require("config");

Feature("Navigation BDD");

BeforeSuite(async ({ I, login }) => {
  await login("gitlab");
  await I.removeAllThreads();
});

Before(({ I, GitlabPage }) => {
  I.amOnPage(config.get("codeceptjs.gitlab.overviewPage"));
  GitlabPage.waitPageIsReady();
  I.clearLocalStorage();
});

Scenario(
  "Plugin is loaded when navigating to the diff page",
  ({ I, GitlabPage }) => {
    I.click(GitlabPage.getChangesSelector());
    GitlabPage.openNewThread();
    I.seeElement("$toggle-button");
  }
);
