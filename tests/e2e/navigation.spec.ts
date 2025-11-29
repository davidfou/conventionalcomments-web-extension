import { test, expect } from "./fixtures";
import { Comments } from "./MainPage";

let pullRequestComments: Comments;
let issueComments: Comments;

test.beforeAll(async ({ mainPage }) => {
  await mainPage.removeAllThreads();
  pullRequestComments = await mainPage.retrievePullRequestCommentIds();
  issueComments = await mainPage.retrieveIssueCommentIds();
});

test("Plugin is loaded when navigating to the diff page", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await mainPage.clearLocalStorage();
  await mainPage.getChangesSelector().click();
  const container = await mainPage.openNewThread();
  await expect(page.getByTestId("ccext-container")).toBeVisible();
  await expect(container.locator("textarea")).toHaveValue("**praise:** ");
});

test("Plugin is loaded when navigating to the diff page on a file comment", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await mainPage.clearLocalStorage();
  await mainPage.getChangesSelector().click();
  const container = await mainPage.openNewFileThread();
  await expect(page.getByTestId("ccext-container")).toBeVisible();
  await expect(container.locator("textarea")).toHaveValue("**praise:** ");
});

test("Plugin isn't loaded when navigating to the diff page and check the preview", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await mainPage.clearLocalStorage();
  await mainPage.getChangesSelector().click();
  const container = await mainPage.openNewThread();
  await mainPage.getPreviewButtonSelector(container).click();
  await expect(
    page.getByTestId("ccext-container").filter({ visible: true }),
  ).toHaveCount(0);
});

test("Plugin isn't loaded when navigating to the diff page, check the preview and go back to the form", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await mainPage.clearLocalStorage();
  await mainPage.getChangesSelector().click();
  const container = await mainPage.openNewThread();
  await mainPage.getPreviewButtonSelector(container).click();
  await mainPage.getWriteButtonSelector(container).click();
  await expect(page.getByTestId("ccext-container")).toBeVisible();
});

test("Plugin is not loaded twice when the user navigates back to the diff page", async ({
  mainPage,
  page,
  product,
  version,
}) => {
  test.skip(
    product === "github" && version === 1,
    "The form doesn't open automatically on GitHub V1",
  );
  await mainPage.goToOverviewPage();
  await mainPage.clearLocalStorage();
  await mainPage.getChangesSelector().click();
  const thread = await mainPage.openNewThread();
  await expect(thread.locator("textarea")).toBeFocused();
  await page.keyboard.type("new comment...");
  await mainPage.getOverviewSelector().click();
  await expect(
    page.getByTestId("ccext-container").filter({ visible: true }),
  ).toHaveCount(0);
  await page.goBack();
  await expect(
    page.getByTestId("ccext-container").filter({ visible: true }),
  ).toHaveCount(1);
});

test("Plugin is not loaded on the overview page", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await expect(page.getByTestId("ccext-container")).not.toBeVisible();
});

test("Plugin is not loaded on the overview page (edit description)", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await mainPage.editMainCommentFromPullRequestPage(pullRequestComments);
  await expect(page.getByTestId("ccext-container")).not.toBeVisible();
});

test("Plugin is not loaded on the overview page (edit comment)", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToOverviewPage();
  await mainPage.editCommentFromPullRequestPage(pullRequestComments, 0);
  await expect(page.getByTestId("ccext-container")).not.toBeVisible();
});

test("Plugin is not loaded on the issue page", async ({ mainPage, page }) => {
  await mainPage.goToIssuePage();
  await expect(page.getByTestId("ccext-container")).not.toBeVisible();
});

test("Plugin is not loaded on the issue page (edit description)", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToIssuePage();
  await mainPage.editMainCommentFromIssuePage();
  await expect(page.getByTestId("ccext-container")).not.toBeVisible();
});

test("Plugin is not loaded on the issue page (edit comment)", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToIssuePage();
  await mainPage.editCommentFromIssuePage(issueComments, 0);
  await expect(page.getByTestId("ccext-container")).not.toBeVisible();
});

test("Plugin is not loaded on a new pull request page", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToNewPullRequestPage();
  await expect(page.getByTestId("ccext-container")).not.toBeVisible();
});

test("Plugin is not loaded on a new issue request page", async ({
  mainPage,
  page,
}) => {
  await mainPage.goToNewIssuePage();
  await expect(page.getByTestId("ccext-container")).not.toBeVisible();
});
