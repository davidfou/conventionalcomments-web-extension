import { test, expect } from "./fixtures";

let thread1: { id: string; noteIds: string[] };
let thread2: { id: string; noteIds: string[] };

test.beforeAll(async ({ mainPage }) => {
  await mainPage.removeAllThreads();
  thread1 = await mainPage.createThread(
    ["**question:** any reason not to format comments", "No idea"],
    1
  );
  thread2 = await mainPage.createThread(
    [
      "Check this out",
      "**quibble (if-minor, non-blocking):** let's use conventional comments",
    ],
    3
  );
});

test.beforeEach(async ({ mainPage }) => {
  await mainPage.goToMainPage();
  await mainPage.clearLocalStorage();
});

test("Editing a comment respecting the convention loads the extension", async ({
  mainPage,
  page,
}) => {
  await mainPage.editComment(thread1.id, thread1.noteIds[0]);
  await expect(
    mainPage
      .getMessageContainer(thread1.noteIds[0])
      .getByTestId("toggle-button")
  ).toHaveCount(1);
  await expect(page.getByTestId("label-selector")).toBeVisible();
  await expect(page.getByTestId("decoration-selector")).toBeVisible();
});

test("Editing a comment not respecting the convention doesn't load the extension", async ({
  mainPage,
  page,
}) => {
  await mainPage.editComment(thread2.id, thread2.noteIds[0]);
  await expect(
    mainPage
      .getMessageContainer(thread2.noteIds[0])
      .getByTestId("toggle-button")
  ).toHaveCount(1);
  await expect(page.getByTestId("label-selector")).not.toBeVisible();
  await expect(page.getByTestId("decoration-selector")).not.toBeVisible();
});

test("Editing a reply respecting the convention loads the extension", async ({
  mainPage,
  page,
}) => {
  await mainPage.editComment(thread2.id, thread2.noteIds[1]);
  await expect(
    mainPage
      .getMessageContainer(thread2.noteIds[1])
      .getByTestId("toggle-button")
  ).toHaveCount(1);
  await expect(page.getByTestId("label-selector")).toBeVisible();
  await expect(page.getByTestId("decoration-selector")).toBeVisible();
});

test("Editing a reply not respecting the convention doesn't load the extension", async ({
  mainPage,
  page,
}) => {
  await mainPage.editComment(thread1.id, thread1.noteIds[1]);
  await expect(
    mainPage
      .getMessageContainer(thread1.noteIds[1])
      .getByTestId("toggle-button")
  ).toHaveCount(1);
  await expect(page.getByTestId("label-selector")).not.toBeVisible();
  await expect(page.getByTestId("decoration-selector")).not.toBeVisible();
});

test("The extension is not loaded when adding a new comment to a thread", async ({
  mainPage,
  page,
}) => {
  await mainPage.getReplyInputLocator(thread1.id).click();
  await expect(
    mainPage.getThreadContainer(thread1.id).getByTestId("toggle-button")
  ).toHaveCount(1);
  await expect(page.getByTestId("label-selector")).not.toBeVisible();
  await expect(page.getByTestId("decoration-selector")).not.toBeVisible();
});
