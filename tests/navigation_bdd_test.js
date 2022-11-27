Feature("Navigation BDD");

let pullRequestCommentIds = null;
let issueCommentIds = null;

BeforeSuite(async ({ I }) => {
  I.removeAllThreads();
  pullRequestCommentIds = await I.retrievePullRequestCommentIds();
  issueCommentIds = await I.retrieveIssueCommentIds();
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
  MainPage.goToOverviewPage();
  MainPage.waitPageIsReady();
  I.dontSeeElement("$toggle-button");
});

Scenario(
  "Plugin is not loaded on the overview page (edit description)",
  ({ I, MainPage }) => {
    MainPage.goToOverviewPage();
    MainPage.waitPageIsReady();
    MainPage.editCommentFromMainPage(pullRequestCommentIds[0], {
      isPullRequestDescription: true,
    });
    I.dontSeeElement("$toggle-button");
  }
);

Scenario(
  "Plugin is not loaded on the overview page (edit comment)",
  ({ I, MainPage }) => {
    MainPage.goToOverviewPage();
    MainPage.waitPageIsReady();
    MainPage.editCommentFromMainPage(pullRequestCommentIds[1]);
    I.dontSeeElement("$toggle-button");
  }
);

Scenario("Plugin is not loaded on the issue page", ({ I, MainPage }) => {
  MainPage.goToIssuePage();
  MainPage.waitPageIsReady();
  I.dontSeeElement("$toggle-button");
});

Scenario(
  "Plugin is not loaded on the issue page (edit description)",
  ({ I, MainPage }) => {
    MainPage.goToIssuePage();
    MainPage.waitPageIsReady();
    MainPage.editCommentFromMainPage(issueCommentIds[0], {
      isIssueDescription: true,
    });
    I.dontSeeElement("$toggle-button");
  }
);

Scenario(
  "Plugin is not loaded on the issue page (edit comment)",
  ({ I, MainPage }) => {
    MainPage.goToIssuePage();
    MainPage.waitPageIsReady();
    MainPage.editCommentFromMainPage(issueCommentIds[1]);
    I.dontSeeElement("$toggle-button");
  }
);

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
