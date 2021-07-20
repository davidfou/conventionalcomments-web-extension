const config = require("config");

const { I } = inject();

const getThreadSelectorAttribute = (threadId) => ({
  "data-qa-selector": "discussion_content",
  "data-discussion-id": threadId,
});

const getNoteSelectorAttribute = (noteId) => ({
  "data-qa-selector": "noteable_note_container",
  "data-note-id": noteId.toString(),
});

const getEditButtonAttribute = () => ({
  "data-qa-selector": "note_edit_button",
});

module.exports = {
  async login() {
    const isUserLoggedIn = await tryTo(() => {
      I.amOnPage("https://gitlab.com/users/sign_in");
      return I.seeCurrentUrlEquals("https://gitlab.com/");
    });

    if (isUserLoggedIn) {
      return;
    }

    I.amOnPage("https://gitlab.com/users/sign_in");
    this.waitPageIsReady();
    I.fillField("#user_login", config.get("codeceptjs.gitlab.username"));
    I.fillField(
      "#user_password",
      secret(config.get("codeceptjs.gitlab.password"))
    );
    I.click("Sign in");
  },
  waitPageIsReady() {
    I.waitForElement("body.page-initialised");
  },
  openNewThread() {
    const selector = locate("#diffs").find(
      locate("*").withAttr({
        "data-testid": "left-side",
        "data-interop-type": "old",
        "data-interop-line": "1",
        "data-interop-old-line": "1",
      })
    );
    I.moveCursorTo(selector);
    I.click(
      locate(selector)
        .find("*")
        .withAttr({ "data-qa-selector": "diff_comment_button" })
    );
  },
  getTextareaSelector() {
    return locate("*").withAttr({
      "data-qa-selector": "reply_field",
    });
  },
  getEditCommentSelector(threadId, noteId) {
    return locate("#diffs")
      .find(locate("*").withAttr(getThreadSelectorAttribute(threadId)))
      .find(locate("*").withAttr(getNoteSelectorAttribute(noteId)))
      .find(locate("*").withAttr(getEditButtonAttribute()));
  },
  getReplySelector(threadId) {
    return locate("#diffs")
      .find(locate("*").withAttr(getThreadSelectorAttribute(threadId)))
      .find(
        locate("*").withAttr({ "data-qa-selector": "discussion_reply_tab" })
      );
  },
  getChangesSelector() {
    return locate("*").withAttr({ "data-qa-selector": "diffs_tab" }).find("a");
  },
};
