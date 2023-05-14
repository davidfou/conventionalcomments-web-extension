import config from "config";
import { Octokit } from "octokit";
import type { Page } from "@playwright/test";

import AbstractPage from "./AbstractPage";

const { authenticator } = require("otplib");

class GitHubPage extends AbstractPage {
  private apiClient: Octokit["rest"];

  constructor(page: Page) {
    super(
      "github",
      page,
      page.locator(".inline-comment-form-container.open textarea")
    );
    this.apiClient = new Octokit({
      auth: config.get<string>("codeceptjs.github.token"),
    }).rest;
  }

  async waitPageIsReady() {
    await this.page.locator("html[data-turbo-loaded]").waitFor();
  }

  async removeAllThreads() {
    const { data: comments } = await this.apiClient.pulls.listReviewComments({
      owner: config.get<string>("codeceptjs.github.username"),
      repo: config.get<string>("codeceptjs.github.project"),
      pull_number: 1,
    });
    await Promise.all(
      comments.map(({ id }) =>
        this.apiClient.pulls.deleteReviewComment({
          owner: config.get<string>("codeceptjs.github.username"),
          repo: config.get<string>("codeceptjs.github.project"),
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
      owner: config.get("codeceptjs.github.username"),
      repo: config.get("codeceptjs.github.project"),
      pull_number: 1,
    });
    const { data: comment } = await this.apiClient.pulls.createReviewComment({
      owner: config.get("codeceptjs.github.username"),
      repo: config.get("codeceptjs.github.project"),
      pull_number: 1,
      path: "README.md",
      commit_id: commit.sha,
      body: baseComment,
      line,
      side: "LEFT",
    });

    const noteIds = [comment.id];
    for (const reply of replies) {
      const {
        data: { id },
      } = await this.apiClient.pulls.createReviewComment({
        owner: config.get("codeceptjs.github.username"),
        repo: config.get("codeceptjs.github.project"),
        pull_number: 1,
        body: reply,
        in_reply_to: comment.id,
      });
      noteIds.push(id);
    }

    return { id: noteIds[0], noteIds };
  }

  async retrievePullRequestCommentIds() {
    const { data: pullRequest } = await this.apiClient.pulls.get({
      owner: config.get("codeceptjs.github.username"),
      repo: config.get("codeceptjs.github.project"),
      pull_number: 1,
    });
    const { data: comments } = await this.apiClient.issues.listComments({
      owner: config.get("codeceptjs.github.username"),
      repo: config.get("codeceptjs.github.project"),
      issue_number: 1,
    });

    return [pullRequest.node_id, ...comments.map((comment) => comment.node_id)];
  }

  async retrieveIssueCommentIds() {
    const { data: pullRequest } = await this.apiClient.issues.get({
      owner: config.get("codeceptjs.github.username"),
      repo: config.get("codeceptjs.github.project"),
      issue_number: 2,
    });
    const { data: comments } = await this.apiClient.issues.listComments({
      owner: config.get("codeceptjs.github.username"),
      repo: config.get("codeceptjs.github.project"),
      issue_number: 2,
    });

    return [pullRequest.node_id, ...comments.map((comment) => comment.node_id)];
  }

  async login() {
    const loginUrl = "https://github.com/login";
    await this.page.goto(loginUrl);
    if (this.page.url() === "https://github.com/") {
      return;
    }
    await this.page.fill(
      "#login_field",
      config.get("codeceptjs.github.username")
    );
    await this.page.fill("#password", config.get("codeceptjs.github.password"));
    await this.page.keyboard.press("Enter");
    await this.page.fill(
      "#app_totp",
      authenticator.generate(config.get("codeceptjs.github.twoFactorSecret"))
    );
  }

  async openNewThread() {
    await this.page.click("#files button[data-side='left'][data-line='1']");
  }

  async editComment(threadId: number, noteId: number) {
    await this.page
      .locator(`#r${noteId}`)
      .getByRole("button", { name: "Show options" })
      .click();
    await this.page.getByRole("menuitem", { name: "Edit comment" }).click();
  }

  async editCommentFromMainPage(threadId: string) {
    await this.page
      .locator(`div[data-gid="${threadId}"]`)
      .locator(".timeline-comment-action")
      .last()
      .click();
    await this.page
      .locator(`div[data-gid="${threadId}"]`)
      .locator(".js-comment-edit-button")
      .last()
      .click();
  }

  getReplyInputLocator(threadId: number) {
    return this.page.locator(
      `.comment-holder:has(#r${threadId}) button.review-thread-reply-button`
    );
  }

  getMessageContainer(messageId: number) {
    return this.page.locator(`#r${messageId}`);
  }

  getThreadContainer(threadId: number) {
    return this.page.locator(`.comment-holder:has(#r${threadId})`);
  }
}

export default GitHubPage;
