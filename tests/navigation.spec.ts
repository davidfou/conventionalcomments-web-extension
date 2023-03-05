import { test, expect } from "./fixtures";

let pullRequestCommentIds: string[];
let issueCommentIds: string[];

test.beforeAll(async ({ mainPage }) => {
  await mainPage.removeAllThreads();
  pullRequestCommentIds = await mainPage.retrievePullRequestCommentIds();
  issueCommentIds = await mainPage.retrieveIssueCommentIds();
});

test("Plugin is loaded when navigating to the diff page", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await mainPage.clearLocalStorage();
  await mainPage.changesSelector.click();
  await mainPage.openNewThread();
  await expect(page.getByTestId("toggle-button")).toBeVisible();
});

test("Plugin is not loaded on the overview page", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await expect(page.getByTestId("toggle-button")).not.toBeVisible();
});

test("Plugin is not loaded on the overview page (edit description)", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await mainPage.editCommentFromMainPage(
    pullRequestCommentIds[0],
    "pullRequestDescription"
  );
  await expect(page.getByTestId("toggle-button")).not.toBeVisible();
});

test("Plugin is not loaded on the overview page (edit comment)", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await mainPage.editCommentFromMainPage(pullRequestCommentIds[1]);
  await expect(page.getByTestId("toggle-button")).not.toBeVisible();
});

test("Plugin is not loaded on the issue page", async ({ mainPage, page }) => {
  await mainPage.goToIssuePage();
  await expect(page.getByTestId("toggle-button")).not.toBeVisible();
});

test("Plugin is not loaded on the issue page (edit description)", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToIssuePage();
  await mainPage.editCommentFromMainPage(
    issueCommentIds[0],
    "issueDescription"
  );
  await expect(page.getByTestId("toggle-button")).not.toBeVisible();
});

test("Plugin is not loaded on the issue page (edit comment)", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToIssuePage();
  await mainPage.editCommentFromMainPage(issueCommentIds[1]);
  await expect(page.getByTestId("toggle-button")).not.toBeVisible();
});

test("Plugin is not loaded on a new pull request page", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToNewPullRequestPage();
  await expect(page.getByTestId("toggle-button")).not.toBeVisible();
});

test("Plugin is not loaded on a new issue request page", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToNewIssuePage();
  await expect(page.getByTestId("toggle-button")).not.toBeVisible();
});
