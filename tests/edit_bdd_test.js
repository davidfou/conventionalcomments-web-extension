Feature("Edit BDD");

let thread1 = null;
let thread2 = null;

BeforeSuite(async ({ I, MainPage }) => {
  MainPage.login();
  I.removeAllThreads();
  thread1 = await I.createThread(
    ["**question:** any reason not to format comments", "No idea"],
    1,
    null
  );
  thread2 = await I.createThread(
    [
      "Check this out",
      "**nitpick (if-minor, non-blocking):** let's use conventional comments",
    ],
    3,
    null
  );
});

Before(({ I, MainPage }) => {
  MainPage.goToMainPage();
  MainPage.waitPageIsReady();
  I.clearLocalStorage();
});

Data([
  {
    getData: () => ({
      threadId: thread1.id,
      noteId: thread1.noteIds[0],
    }),
    expectedLabel: "question",
    expectedDecorations: [],
    toString: () => "Main message from thread respecting convention",
  },
  {
    getData: () => ({
      threadId: thread2.id,
      noteId: thread2.noteIds[1],
    }),
    expectedLabel: "nitpick",
    expectedDecorations: ["if-minor", "non-blocking"],
    toString: () => "Comment respecting convention",
  },
]).Scenario("Plugin is activated", async ({ I, MainPage, current }) => {
  const { threadId, noteId } = current.getData();
  I.click(MainPage.getEditCommentSelector(threadId, noteId));
  I.see(current.expectedLabel, "$label-selector");
  I.see(current.expectedDecorations.join("\n"), "$decoration-selector");
});

Data([
  {
    getData: () => ({
      threadId: thread2.id,
      noteId: thread2.noteIds[0],
    }),
    toString: () => "Main message from thread not respecting convention",
  },
  {
    getData: () => ({
      threadId: thread1.id,
      noteId: thread1.noteIds[1],
    }),
    toString: () => "Comment not respecting convention",
  },
]).Scenario("Plugin isn't activated", ({ I, MainPage, current }) => {
  const { threadId, noteId } = current.getData();
  I.click(MainPage.getEditCommentSelector(threadId, noteId));
  I.seeElement("$toggle-button");
  I.dontSeeElement("$label-selector");
  I.dontSeeElement("$decoration-selector");
});

Scenario(
  "Plugin isn't activated when adding a new comment to a thread",
  ({ I, MainPage }) => {
    I.click(MainPage.getReplySelector(thread1.id));
    I.seeElement("$toggle-button");
    I.dontSeeElement("$label-selector");
    I.dontSeeElement("$decoration-selector");
  }
);
