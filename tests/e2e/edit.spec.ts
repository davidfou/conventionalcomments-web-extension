import { test, expect } from "./fixtures";
import { Thread } from "./MainPage";

let thread1: Thread;
let thread2: Thread;

test.beforeAll(async ({ mainPage }) => {
  await mainPage.removeAllThreads();
  thread1 = await mainPage.createThread(
    ["**question:** any reason not to format comments", "No idea"],
    1,
  );
  thread2 = await mainPage.createThread(
    [
      "Check this out",
      "**nitpick (if-minor, non-blocking):** let's use conventional comments",
    ],
    3,
  );
});

test.beforeEach(async ({ mainPage }) => {
  await mainPage.goToMainPage();
  await mainPage.clearLocalStorage();
});

test("Editing a comment respecting the convention loads the extension", async ({
  mainPage,
}) => {
  await mainPage.editComment(thread1, 0);
  const container = mainPage
    .getMessageContainer(thread1, 0)
    .getByTestId("ccext-container");
  await expect(container).toBeVisible();
  await expect
    .soft(container.getByTestId("label-combobox").getByTestId("combobox-value"))
    .toHaveAttribute("data-testvalue", "question");
  await expect
    .soft(
      container
        .getByTestId("decorations-combobox")
        .getByTestId("combobox-value"),
    )
    .toHaveAttribute("data-testvalue", "");
});

test("Editing a comment not respecting the convention doesn't load the extension", async ({
  mainPage,
}) => {
  await mainPage.editComment(thread2, 0);
  const container = mainPage
    .getMessageContainer(thread2, 0)
    .getByTestId("ccext-container");
  await expect(container).toBeVisible();
  await expect
    .soft(container.getByTestId("label-combobox").getByTestId("combobox-value"))
    .toHaveAttribute("data-testvalue", "none");
  await expect
    .soft(
      container
        .getByTestId("decorations-combobox")
        .getByTestId("combobox-value"),
    )
    .toHaveAttribute("data-testvalue", "");
});

test("Editing a reply respecting the convention loads the extension", async ({
  mainPage,
}) => {
  await mainPage.editComment(thread2, 1);
  const container = mainPage
    .getMessageContainer(thread2, 1)
    .getByTestId("ccext-container");
  await expect(container).toBeVisible();
  await expect
    .soft(container.getByTestId("label-combobox").getByTestId("combobox-value"))
    .toHaveAttribute("data-testvalue", "nitpick");
  await expect
    .soft(
      container
        .getByTestId("decorations-combobox")
        .getByTestId("combobox-value"),
    )
    .toHaveAttribute("data-testvalue", "if-minor|non-blocking");
});

test("Editing a reply not respecting the convention doesn't load the extension", async ({
  mainPage,
}) => {
  await mainPage.editComment(thread1, 1);
  const container = mainPage
    .getMessageContainer(thread1, 1)
    .getByTestId("ccext-container");
  await expect(container).toBeVisible();
  await expect
    .soft(container.getByTestId("label-combobox").getByTestId("combobox-value"))
    .toHaveAttribute("data-testvalue", "none");
  await expect
    .soft(
      container
        .getByTestId("decorations-combobox")
        .getByTestId("combobox-value"),
    )
    .toHaveAttribute("data-testvalue", "");
});

test("The extension is not loaded when adding a new comment to a thread", async ({
  mainPage,
}) => {
  await mainPage.getReplyInputLocator(thread1).click();
  const container = mainPage
    .getThreadContainer(thread1)
    .getByTestId("ccext-container");
  await expect(container).toBeVisible();
  await expect
    .soft(container.getByTestId("label-combobox").getByTestId("combobox-value"))
    .toHaveAttribute("data-testvalue", "none");
  await expect
    .soft(
      container
        .getByTestId("decorations-combobox")
        .getByTestId("combobox-value"),
    )
    .toHaveAttribute("data-testvalue", "");
});
