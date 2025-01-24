import config from "config";
import { Octokit } from "octokit"; // eslint-disable-line
import { authenticator } from "otplib";
import type { Locator, Page } from "@playwright/test";

import AbstractPage from "./AbstractPage";
import { expect } from "../fixtures";

const MAX_RETRY = 4;

class GitHubPage extends AbstractPage {
  private apiClient: Octokit["rest"];

  constructor(page: Page) {
    super("github", page);
    this.apiClient = new Octokit({
      auth: config.get<string>("e2e.github.token"),
    }).rest;
  }

  get newCommentEditorLocator(): Locator {
    return this.page
      .locator(".js-previewable-comment-form")
      .filter({ has: this.page.getByTestId("toggle-button") });
  }

  get textareaLocator(): Locator {
    return this.page.locator(".inline-comment-form-container.open textarea");
  }

  async waitPageIsReady() {
    await this.page.locator("html[data-turbo-loaded]").waitFor();
  }

  async removeAllThreads() {
    const { data: comments } = await this.apiClient.pulls.listReviewComments({
      owner: config.get<string>("e2e.github.username"),
      repo: config.get<string>("e2e.github.project"),
      pull_number: 1,
    });
    await Promise.all(
      comments.map(({ id }) =>
        this.apiClient.pulls.deleteReviewComment({
          owner: config.get<string>("e2e.github.username"),
          repo: config.get<string>("e2e.github.project"),
          comment_id: id,
        })
      )
    );
  }

  async createThread(comments: string[], line: number) {
    const [baseComment, ...replies] = comments;

    const {
      data: [commit],
    } = await this.apiClient.pulls.listCommits({
      owner: config.get("e2e.github.username"),
      repo: config.get("e2e.github.project"),
      pull_number: 1,
    });
    const { data: comment } = await this.apiClient.pulls.createReviewComment({
      owner: config.get("e2e.github.username"),
      repo: config.get("e2e.github.project"),
      pull_number: 1,
      path: "README.md",
      commit_id: commit.sha,
      body: baseComment,
      line,
      side: "LEFT",
    });

    const noteIds = [comment.id.toString()];
    for (const reply of replies) {
      const {
        data: { id },
      } = await this.apiClient.pulls.createReviewComment({
        owner: config.get("e2e.github.username"),
        repo: config.get("e2e.github.project"),
        pull_number: 1,
        path: "README.md",
        commit_id: commit.sha,
        body: reply,
        in_reply_to: comment.id,
      });
      noteIds.push(id.toString());
    }

    return { id: noteIds[0].toString(), noteIds };
  }

  async retrievePullRequestCommentIds() {
    const { data: pullRequest } = await this.apiClient.pulls.get({
      owner: config.get("e2e.github.username"),
      repo: config.get("e2e.github.project"),
      pull_number: 1,
    });
    const { data: comments } = await this.apiClient.issues.listComments({
      owner: config.get("e2e.github.username"),
      repo: config.get("e2e.github.project"),
      issue_number: 1,
    });

    return [pullRequest.node_id, ...comments.map((comment) => comment.node_id)];
  }

  async retrieveIssueCommentIds() {
    const { data: pullRequest } = await this.apiClient.issues.get({
      owner: config.get("e2e.github.username"),
      repo: config.get("e2e.github.project"),
      issue_number: 2,
    });
    const { data: comments } = await this.apiClient.issues.listComments({
      owner: config.get("e2e.github.username"),
      repo: config.get("e2e.github.project"),
      issue_number: 2,
    });

    return [pullRequest.node_id, ...comments.map((comment) => comment.node_id)];
  }

  async login() {
    await this.page.goto("https://github.com/login");
    if (this.page.url() === "https://github.com/") {
      return null;
    }
    await this.page.fill("#login_field", config.get("e2e.github.username"));
    await this.page.fill("#password", config.get("e2e.github.password"));
    await this.page.keyboard.press("Enter");
    await this.page.fill(
      "#app_totp",
      authenticator.generate(config.get("e2e.github.twoFactorSecret"))
    );
    await this.page.waitForURL("https://github.com");

    return this.page.context();
  }

  async openNewThread() {
    await this.page.click("#files button[data-side='left'][data-line='1']");
  }

  async editComment(threadId: string, messageId: string) {
    await this.page
      .locator(`#r${messageId}`)
      .getByRole("button", { name: "Show options" })
      .click();
    await this.page.getByRole("menuitem", { name: "Edit comment" }).click();
  }

  async editCommentFromMainPage(messageId: string) {
    await this.page
      .locator(`div[data-gid="${messageId}"]`)
      .locator(".timeline-comment-action")
      .last()
      .click();
    await this.page
      .locator(`div[data-gid="${messageId}"]`)
      .locator(".js-comment-edit-button")
      .last()
      .click();
  }

  getReplyInputLocator(threadId: string) {
    return this.page.locator(
      `.comment-holder:has(#r${threadId}) button.review-thread-reply-button`
    );
  }

  getMessageContainer(messageId: string) {
    return this.page.locator(`#r${messageId}`);
  }

  getThreadContainer(threadId: string) {
    return this.page.locator(`.comment-holder:has(#r${threadId})`);
  }

  async getAvailableThemes() {
    await this.page.goto("https://github.com/settings/appearance");
    const locators = await this.page.locator('input[name="user_theme"]').all();
    return Promise.all(locators.map((locator) => locator.inputValue()));
  }

  async selectTheme(theme: string) {
    let isSelected = false;
    let attempt = 0;
    while (!isSelected && attempt < MAX_RETRY) {
      attempt += 1;
      await this.page.goto("https://github.com/settings/appearance");
      await this.page
        .locator("select#color_mode_type_select")
        .selectOption("single");
      isSelected = await this.page.locator(`input#option-${theme}`).isChecked();
      if (isSelected) {
        break;
      }
      const waitForRequest = this.page.waitForRequest(
        (request) =>
          request.url() ===
            "https://github.com/settings/appearance/color_mode" &&
          request.method() === "POST"
      );
      await this.page.locator(`input#option-${theme}`).check();
      await waitForRequest;
      await this.page.waitForTimeout(1000);
    }

    expect(isSelected).toBe(true);
  }
}

export default GitHubPage;
