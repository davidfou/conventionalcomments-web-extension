import config from "config";
import { Gitlab as GitlabClient } from "@gitbeaker/rest";
import type { Gitlab } from "@gitbeaker/core";
import type { Locator, Page } from "@playwright/test";

import AbstractPage from "../AbstractPage";
import getCookies from "./getCookies";

class GitLabPage extends AbstractPage {
  private apiClient: Gitlab<true>;

  private projectPath: string;

  constructor(page: Page) {
    super("gitlab", page);
    this.apiClient = new GitlabClient({
      token: config.get<string>("e2e.gitlab.token"),
      camelize: true,
    });
    this.projectPath = [
      config.get<string>("e2e.gitlab.username"),
      config.get<string>("e2e.gitlab.project"),
    ].join("/");
  }

  get newCommentEditorLocator(): Locator {
    return this.page.locator(".edit-note");
  }

  get textareaLocator(): Locator {
    return this.page.locator("*[data-testid='reply-field']");
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
          baseSha: mergeRequest.diffRefs.baseSha,
          startSha: mergeRequest.diffRefs.startSha,
          headSha: mergeRequest.diffRefs.headSha,
          positionType: "text",
          oldPath: "README.md",
          newPath: "README.md",
          oldLine: line.toString(),
        },
      }
    );

    if (discussion.notes?.[0] === undefined) {
      throw new Error("Expected discussion to have at least one note");
    }

    const noteIds = [discussion.notes[0].id.toString()];
    let previousNoteId = discussion.notes[0].id;
    for (const reply of replies) {
      const note = await this.apiClient.MergeRequestDiscussions.addNote(
        this.projectPath,
        1,
        discussion.id,
        previousNoteId,
        reply
      );
      previousNoteId = note.id;
      noteIds.push(note.id.toString());
    }

    return { id: discussion.id, noteIds };
  }

  async retrievePullRequestCommentIds() {
    const notes = await this.apiClient.MergeRequestNotes.all(
      this.projectPath,
      1
    );
    return [
      "",
      ...notes
        .filter(({ type, system }) => type === null && !system)
        .map(({ id }) => id.toString()),
    ];
  }

  async retrieveIssueCommentIds() {
    const notes = await this.apiClient.IssueNotes.all(this.projectPath, 1);
    return ["", ...notes.map(({ id }) => id.toString())];
  }

  async login() {
    await this.page.goto("https://gitlab.com");
    if (this.page.url() !== "https://about.gitlab.com/") {
      return null;
    }

    if (!config.get<boolean>("playwright.skipGitLabLogin")) {
      throw new Error("User login not available");
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
    threadId: string,
    messageId: string
  ): Locator {
    return (
      threadId === "" ? this.page : this.getThreadContainer(threadId)
    ).locator(
      `*[data-testid='noteable-note-container'][data-note-id=${JSON.stringify(
        messageId
      )}]`
    );
  }

  private getNoteEditSelector(threadId: string, messageId: string): Locator {
    return this.getNoteContainerSelector(threadId, messageId).locator(
      "*[data-testid='note-edit-button']"
    );
  }

  async editComment(threadId: string, commentId: string) {
    await this.getNoteEditSelector(threadId, commentId).click();
  }

  async editCommentFromMainPage(
    messageId: string,
    pageType?: "pullRequestDescription" | "issueDescription"
  ) {
    switch (pageType) {
      case "pullRequestDescription":
        await this.page.goto(
          config.get<string>("e2e.gitlab.editPullRequestPage")
        );
        break;
      case "issueDescription":
        await this.page.click(
          "button[aria-label='Edit title and description']"
        );
        break;
      default:
        await this.getNoteEditSelector("", messageId).click();
    }
  }

  getReplyInputLocator(threadId: string) {
    return this.getThreadContainer(threadId).locator(
      "*[data-testid='discussion-reply-tab']"
    );
  }

  getMessageContainer(messageId: string) {
    return this.getNoteContainerSelector("", messageId);
  }

  getThreadContainer(threadId: string): Locator {
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
      .locator("div.gl-form-radio")
      .filter({ has: this.page.locator("input[name='user[theme_id]']") })
      .locator("label")
      .all();
    return Promise.all(
      locators.map((locator) =>
        locator.textContent().then((text) => {
          if (text === null) {
            throw new Error("Expect text to be defined");
          }
          return text.trim();
        })
      )
    );
  }

  async selectTheme(theme: string) {
    await this.page.goto("https://gitlab.com/-/profile/preferences");
    await this.waitPageIsReady();

    const currentValue = await this.page
      .locator("div.gl-form-radio")
      .filter({
        has: this.page.locator("input[name='user[theme_id]']:checked"),
      })
      .locator("label")
      .textContent();

    if (currentValue === theme) {
      return;
    }

    await this.page
      .locator("div.gl-form-radio")
      .filter({
        has: this.page.locator(`//label/span[text()=${JSON.stringify(theme)}]`),
      })
      .locator("label")
      .click();
    await this.page.waitForLoadState();
    await this.waitPageIsReady();
    await this.page.waitForTimeout(5_000);
  }
}

export default GitLabPage;
