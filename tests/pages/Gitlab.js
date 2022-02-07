const config = require("config");
const { firefox } = require("playwright");
const trim = require("lodash.trim");

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

const COOKIE_NAME = "_gitlab_session";

const setSessionCookie = async (page) => {
  const currentCookies = await page.context().cookies("https://gitlab.com");
  const isUserLoggedIn = currentCookies.some(
    ({ name }) => name === COOKIE_NAME
  );
  if (isUserLoggedIn) {
    return;
  }

  const browser = await firefox.launch();
  const newPage = await browser.newPage();

  await newPage.goto("https://gitlab.com/users/sign_in");
  await newPage.fill(
    '[data-qa-selector="login_field"]',
    config.get("codeceptjs.gitlab.username")
  );
  await newPage.fill(
    '[data-qa-selector="password_field"]',
    config.get("codeceptjs.gitlab.password")
  );
  await newPage.click('[data-qa-selector="sign_in_button"]');

  const cookies = await newPage.context().cookies("https://gitlab.com");
  await browser.close();
  await page
    .context()
    .addCookies([cookies.find(({ name }) => name === COOKIE_NAME)]);
};

module.exports = {
  async login() {
    I.usePlaywrightTo("set cookie", async ({ page }) => {
      await setSessionCookie(page);
    });
  },
  goToMainPage() {
    I.amOnPage(config.get("codeceptjs.gitlab.mainPage"));
  },
  goToOverviewPage() {
    I.amOnPage(config.get("codeceptjs.gitlab.overviewPage"));
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
  editComment(threadId, noteId) {
    I.click(
      locate("#diffs")
        .find(locate("*").withAttr(getThreadSelectorAttribute(threadId)))
        .find(locate("*").withAttr(getNoteSelectorAttribute(noteId)))
        .find(locate("*").withAttr(getEditButtonAttribute()))
    );
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
  getNewCommentEditorSelector() {
    return locate(".edit-note");
  },
  async getThemes() {
    I.amOnPage("https://gitlab.com/-/profile/preferences");
    this.waitPageIsReady();
    const themes = await I.grabTextFromAll(
      locate("label").withChild('input[name="user[theme_id]"]')
    );
    return themes.map((theme) => trim(theme));
  },
  async selectTheme(theme) {
    I.amOnPage("https://gitlab.com/-/profile/preferences");
    this.waitPageIsReady();
    const expectedValue = await I.grabValueFrom(
      locate('input[name="user[theme_id]"]').inside(
        locate("label").withText(theme)
      )
    );
    const currentValue = await I.grabValueFrom(
      locate('input[name="user[theme_id]"]:checked')
    );
    if (currentValue !== expectedValue) {
      I.clickAndWaitForResponse(
        locate('input[name="user[theme_id]"]').inside(
          locate("label").withText(theme)
        ),
        "POST",
        "https://gitlab.com/-/profile/preferences"
      );
    }
  },
};
