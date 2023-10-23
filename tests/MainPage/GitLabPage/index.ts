import config from "config";
import { Gitlab } from "@gitbeaker/rest";
import { authenticator } from "otplib";
import type { Locator, Page } from "@playwright/test";

import AbstractPage from "../AbstractPage";
import getCookies from "./getCookies";

class GitLabPage extends AbstractPage<string, number> {
  private apiClient: InstanceType<typeof Gitlab>;

  private projectPath: string;

  constructor(page: Page) {
    super(
      "gitlab",
      page,
      page.locator("*[data-testid='reply-field']"),
      page.locator(".edit-note")
    );
    this.apiClient = new Gitlab({
      token: config.get<string>("codeceptjs.gitlab.token"),
    });
    this.projectPath = [
      config.get<string>("codeceptjs.gitlab.username"),
      config.get<string>("codeceptjs.gitlab.project"),
    ].join("/");
  }

  async waitPageIsReady() {
    await this.page.locator("body.page-initialised").waitFor();
  }

  async removeAllThreads() {
    const notes = await this.apiClient.MergeRequestNotes.all(
      this.projectPath,
      1
    );
    await Promise.all(
      notes
        .filter(({ type }) => type === "DiffNote")
        .map(({ id }) =>
          this.apiClient.MergeRequestNotes.remove(this.projectPath, 1, id)
        )
    );
  }

  async createThread(comments: string[], line: number) {
    const [baseComment, ...replies] = comments;
    const mergeRequest = await this.apiClient.MergeRequests.show(
      this.projectPath,
      1
    );

    const discussion = await this.apiClient.MergeRequestDiscussions.create(
      this.projectPath,
      1,
      baseComment,
      {
        position: {
          ...mergeRequest.diff_refs,
          old_path: "README.md",
          new_path: "README.md",
          position_type: "text",
          old_line: line,
          new_line: null,
        },
      }
    );

    if (discussion.notes?.[0] === undefined) {
      throw new Error("Expected discussion to have at least one note");
    }

    const noteIds = [discussion.notes[0].id];
    let previousNoteId = discussion.notes[0].id;
    /* eslint-disable no-await-in-loop,no-restricted-syntax */
    for (const reply of replies) {
      const note = await this.apiClient.MergeRequestDiscussions.addNote(
        this.projectPath,
        1,
        discussion.id,
        previousNoteId,
        reply
      );
      previousNoteId = note.id;
      noteIds.push(note.id);
    }

    return { id: discussion.id, noteIds };
  }

  async retrievePullRequestCommentIds() {
    const notes = await this.apiClient.MergeRequestNotes.all(
      this.projectPath,
      1
    );
    return [
      null,
      ...notes.filter(({ type }) => type === null).map(({ id }) => id),
    ];
  }

  async retrieveIssueCommentIds() {
    const notes = await this.apiClient.IssueNotes.all(this.projectPath, 1);
    return [null, ...notes.map(({ id }) => id)];
  }

  async login() {
    await this.page.goto("https://gitlab.com");
    if (this.page.url() !== "https://about.gitlab.com/") {
      return null;
    }

    const cookies = await getCookies();
    await this.page.context().addCookies(cookies);
    await this.page.goto("https://gitlab.com/");
    if (this.page.url() === "https://about.gitlab.com/") {
      throw new Error("User should be logged in");
    }

    return this.page.context();
  }

  async openNewThread() {
    await this.page
      .locator("#diffs")
      .locator(
        "*[data-testid=left-side][data-interop-type=old][data-interop-line='1'][data-interop-old-line='1']"
      )
      .locator("*[data-testid='left-comment-button']")
      .click();
  }

  private getNoteContainerSelector(
    threadId: number | null,
    noteId: number
  ): Locator {
    return (
      threadId === null ? this.page : this.getThreadContainer(threadId)
    ).locator(
      `*[data-testid='noteable-note-container'][data-note-id=${JSON.stringify(
        noteId.toString()
      )}]`
    );
  }

  private getNoteEditSelector(
    threadId: number | null,
    noteId: number
  ): Locator {
    return this.getNoteContainerSelector(threadId, noteId).locator(
      "*[data-testid='note-edit-button']"
    );
  }

  async editComment(threadId: number, noteId: number) {
    await this.getNoteEditSelector(threadId, noteId).click();
  }

  async editCommentFromMainPage(
    noteId: number,
    pageType?: "pullRequestDescription" | "issueDescription"
  ) {
    switch (pageType) {
      case "pullRequestDescription":
        await this.page.goto(
          config.get<string>("codeceptjs.gitlab.editPullRequestPage")
        );
        break;
      case "issueDescription":
        await this.page.click(
          "button[aria-label='Edit title and description']"
        );
        break;
      default:
        await this.getNoteEditSelector(null, noteId).click();
    }
  }

  getReplyInputLocator(threadId: number) {
    return this.getThreadContainer(threadId).locator(
      "*[data-testid='discussion-reply-tab']"
    );
  }

  getMessageContainer(messageId: number) {
    return this.getNoteContainerSelector(null, messageId);
  }

  getThreadContainer(threadId: number): Locator {
    return this.page.locator(
      `*[data-testid='discussion-content'][data-discussion-id=${JSON.stringify(
        threadId
      )}]`
    );
  }

  async getAvailableThemes() {
    await this.page.goto("https://gitlab.com/-/profile/preferences");
    await this.waitPageIsReady();
    const locators = await this.page
      .locator("div")
      .filter({ has: this.page.locator("input[name='user[theme_id]']") })
      .locator("label")
      .all();
    return Promise.all(
      locators.map((locator) =>
        locator.textContent().then((text) => {
          if (text === null) {
            throw new Error("Expect text to be defined");
          }
          return text;
        })
      )
    );
  }

  async selectTheme(theme: string) {
    await this.page.goto("https://gitlab.com/-/profile/preferences");
    await this.waitPageIsReady();

    const currentValue = await this.page
      .locator("div")
      .filter({
        has: this.page.locator("input[name='user[theme_id]']:checked"),
      })
      .locator("label")
      .textContent();

    if (currentValue === theme) {
      return;
    }

    const waitForRequest = this.page.waitForRequest(
      (request) =>
        request.url() === "https://gitlab.com/-/profile/preferences" &&
        request.method() === "POST"
    );

    await this.page
      .locator("div")
      .filter({
        has: this.page.locator(`//label/span[text()=${JSON.stringify(theme)}]`),
      })
      .locator("input")
      .check();
    await waitForRequest;
  }
}

export default GitLabPage;
