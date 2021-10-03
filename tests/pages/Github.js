const config = require("config");
const { authenticator } = require("otplib");

const { I } = inject();

module.exports = {
  async login() {
    const isUserLoggedIn = await tryTo(() => {
      I.amOnPage("https://github.com/login");
      return I.seeCurrentUrlEquals("https://github.com/");
    });

    if (isUserLoggedIn) {
      return;
    }

    I.amOnPage("https://github.com/login");
    I.fillField("#login_field", config.get("codeceptjs.github.username"));
    I.fillField("#password", secret(config.get("codeceptjs.github.password")));
    I.pressKey("Enter");
    I.waitForElement("#otp");
    I.fillField(
      "#otp",
      secret(
        authenticator.generate(config.get("codeceptjs.github.twoFactorSecret"))
      )
    );
  },
  goToMainPage() {
    I.amOnPage(config.get("codeceptjs.github.mainPage"));
  },
  goToOverviewPage() {
    I.amOnPage(config.get("codeceptjs.github.overviewPage"));
  },
  waitPageIsReady() {},
  openNewThread() {
    I.click(
      locate("#files").find(
        locate("button").withAttr({
          "data-side": "left",
          "data-line": "1",
        })
      )
    );
  },
  getTextareaSelector() {
    return locate(".inline-comment-form-container.open textarea");
  },
  editComment(_, noteId) {
    I.click(locate(`#details-r${noteId}`).find(".timeline-comment-action"));
    I.click(locate(`#details-r${noteId}`).find(".js-comment-edit-button"));
  },
  getReplySelector(threadId) {
    return locate("button.review-thread-reply-button").inside(
      locate(".js-resolvable-thread-contents").withDescendant(`#r${threadId}`)
    );
  },
  getChangesSelector() {
    return locate("a").withAttr({
      href: config.get("codeceptjs.github.mainPage"),
    });
  },
  getNewCommentEditorSelector() {
    return locate(".js-previewable-comment-form");
  },
};
