import type { BrowserContext, Page } from "@playwright/test";
import { Locator } from "@playwright/test";
import { authenticator } from "otplib";
import { AbstractMainPage } from "./AbstractMainPage";
import type { Config } from "../config";
import { Octokit } from "octokit";
import invariant from "tiny-invariant";
import { CommentsMap, ThreadMap } from "./types";
import { expect } from "../fixtures";

type GitHubThread = ThreadMap["github"];
type GitHubComments = CommentsMap["github"];

const MAX_RETRY = 4;

export default class GitHubPageV1 extends AbstractMainPage<"github"> {
  private apiClient: Octokit["rest"];

  constructor(page: Page, config: Config) {
    super("github", page, config);
    this.apiClient = new Octokit({
      auth: this.config.token,
    }).rest;
  }

  async login(): Promise<BrowserContext | null> {
    await this.page.goto("https://github.com/login");
    if (this.page.url() === "https://github.com/") {
      return null;
    }
    await this.page.fill("#login_field", this.config.username);
    await this.page.fill("#password", this.config.password);
    await this.page.keyboard.press("Enter");
    await this.page.fill(
      "#app_totp",
      authenticator.generate(this.config.twoFactorSecret),
    );
    await this.page.waitForURL("https://github.com");

    return this.page.context();
  }

  async removeAllThreads(): Promise<void> {
    const { data: comments } = await this.apiClient.pulls.listReviewComments({
      owner: this.config.username,
      repo: this.config.project,
      pull_number: 1,
    });
    await Promise.all(
      comments.map(({ id }) =>
        this.apiClient.pulls.deleteReviewComment({
          owner: this.config.username,
          repo: this.config.project,
          comment_id: id,
        }),
      ),
    );
  }

  async createThread(comments: string[], line: number): Promise<GitHubThread> {
    const [baseComment, ...replies] = comments;

    const {
      data: [commit],
    } = await this.apiClient.pulls.listCommits({
      owner: this.config.username,
      repo: this.config.project,
      pull_number: 1,
    });
    const { data: comment } = await this.apiClient.pulls.createReviewComment({
      owner: this.config.username,
      repo: this.config.project,
      pull_number: 1,
      path: "README.md",
      commit_id: commit.sha,
      body: baseComment,
      line,
      side: "LEFT",
    });

    const commentIds = [comment.id];
    for (const reply of replies) {
      const {
        data: { id },
      } = await this.apiClient.pulls.createReviewComment({
        owner: this.config.username,
        repo: this.config.project,
        pull_number: 1,
        path: "README.md",
        commit_id: commit.sha,
        body: reply,
        in_reply_to: comment.id,
      });
      commentIds.push(id);
    }

    return { type: "github", commentIds };
  }

  async retrievePullRequestCommentIds(): Promise<GitHubComments> {
    const { data: pullRequest } = await this.apiClient.pulls.get({
      owner: this.config.username,
      repo: this.config.project,
      pull_number: 1,
    });
    const { data: comments } = await this.apiClient.issues.listComments({
      owner: this.config.username,
      repo: this.config.project,
      issue_number: 1,
    });

    return {
      type: "github",
      id: pullRequest.id,
      commentIds: comments.map((comment) => comment.id),
    };
  }

  async retrieveIssueCommentIds(): Promise<GitHubComments> {
    const { data: issue } = await this.apiClient.issues.get({
      owner: this.config.username,
      repo: this.config.project,
      issue_number: 2,
    });
    const { data: comments } = await this.apiClient.issues.listComments({
      owner: this.config.username,
      repo: this.config.project,
      issue_number: 2,
    });

    return {
      type: "github",
      id: issue.id,
      commentIds: comments.map((comment) => comment.id),
    };
  }

  protected getThreadContainerImpl(thread: GitHubThread): Locator {
    const commentId = thread.commentIds.at(0);
    invariant(commentId !== undefined, "The thread has no comments.");
    return this.page.locator(`.comment-holder:has(#r${commentId})`);
  }

  protected getMessageContainerImpl(
    thread: GitHubThread,
    commentIndex: number,
  ): Locator {
    const commentId = thread.commentIds.at(commentIndex);
    invariant(
      commentId !== undefined,
      `The thread has ${thread.commentIds.length} comments, comment at index ${commentIndex} is not valid.`,
    );
    return this.page.locator(`#r${commentId}`);
  }

  protected getReplyInputLocatorImpl(thread: GitHubThread): Locator {
    const commentId = thread.commentIds.at(0);
    invariant(commentId !== undefined, "The thread has no comments.");
    return this.page.locator(
      `.comment-holder:has(#r${commentId}) button.review-thread-reply-button`,
    );
  }

  getChangesSelector(): Locator {
    return this.page
      .locator(`a[href="${this.config.mainPageUrl}"]`)
      .filter({ visible: true })
      .first();
  }

  getOverviewSelector(): Locator {
    return this.page
      .locator(`a[href="${this.config.overviewPageUrl}"]`)
      .filter({ visible: true })
      .first();
  }

  getPreviewButtonSelector(container: Locator): Locator {
    return container.getByRole("tab", { name: "Preview" });
  }

  getWriteButtonSelector(container: Locator): Locator {
    return container.getByRole("tab", { name: "Write" });
  }

  getNewCommentEditorLocator(): Locator {
    return this.page.locator("form.js-inline-comment-form");
  }

  protected async editCommentImpl(
    thread: GitHubThread,
    commentIndex: number,
  ): Promise<void> {
    const commentId = thread.commentIds.at(commentIndex);
    invariant(
      commentId !== undefined,
      `The thread has ${thread.commentIds.length} comments, comment at index ${commentIndex} is not valid.`,
    );
    await this.getMessageContainer(thread, commentIndex)
      .getByRole("button", { name: "Show options" })
      .click();
    await this.page.getByRole("menuitem", { name: "Edit comment" }).click();
  }

  protected async editMainCommentFromPullRequestPageImpl(
    comments: GitHubComments,
  ): Promise<void> {
    await this.page
      .locator(`#pullrequest-${comments.id}`)
      .getByRole("button", { name: "Show options" })
      .click();
    await this.page
      .locator(`#pullrequest-${comments.id}`)
      .getByRole("menuitem", { name: "Edit comment" })
      .click();
  }

  protected async editCommentFromPullRequestPageImpl(
    comments: GitHubComments,
    commentIndex: number,
  ): Promise<void> {
    const commentId = comments.commentIds.at(commentIndex);
    invariant(
      commentId !== undefined,
      `The pull-request has ${comments.commentIds.length} comments, comment at index ${commentIndex} is not valid.`,
    );
    await this.page
      .locator(`#issuecomment-${commentId}`)
      .getByRole("button", { name: "Show options" })
      .click();
    await this.page
      .locator(`#issuecomment-${commentId}`)
      .getByRole("menuitem", { name: "Edit comment" })
      .click();
  }

  async editMainCommentFromIssuePage(): Promise<void> {
    await this.page
      .getByTestId("issue-body")
      .getByRole("button", { name: "Issue body actions" })
      .click();
    await this.page
      .getByRole("menu", { name: "Issue body actions" })
      .getByRole("menuitem", { name: "Edit" })
      .click();
  }

  protected async editCommentFromIssuePageImpl(
    comments: GitHubComments,
    commentIndex: number,
  ): Promise<void> {
    const commentId = comments.commentIds.at(commentIndex);
    invariant(
      commentId !== undefined,
      `The issue has ${comments.commentIds.length} comments, comment at index ${commentIndex} is not valid.`,
    );
    await this.page
      .locator(`#issuecomment-${commentId}`)
      .getByRole("button")
      .click();
    await this.page.getByRole("menuitem", { name: "Edit" }).click();
  }

  async openNewThread(): Promise<Locator> {
    const buttonLocator = this.page.locator(
      "button[data-side='left'][data-line='1']",
    );
    await this.page
      .locator("td.js-file-line")
      .filter({ has: buttonLocator })
      .hover({ position: { x: 10, y: 0 } });
    await this.page
      .locator("td.js-file-line")
      .filter({ has: buttonLocator })
      .hover({ position: { x: 10, y: 1 } });
    await this.page
      .locator("td.js-file-line")
      .filter({ has: buttonLocator })
      .hover({ position: { x: 10, y: 2 } });
    await buttonLocator.click();
    return this.page
      .locator("form")
      .filter({
        has: this.page.locator(
          "input[type='hidden'][name='position'][value='1']",
        ),
      })
      .filter({
        has: this.page.locator(
          "input[type='hidden'][name='side'][value='left']",
        ),
      });
  }

  async waitPageIsReady(): Promise<void> {
    await this.page.locator("html[data-turbo-loaded]").waitFor();
  }

  async getAvailableThemes(): Promise<string[]> {
    await this.page.goto("https://github.com/settings/appearance");
    const locators = await this.page.locator('input[name="user_theme"]').all();
    return Promise.all(locators.map((locator) => locator.inputValue()));
  }

  async selectTheme(theme: string): Promise<void> {
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
      const waitForResponse = this.page.waitForResponse(
        (response) =>
          response.url() ===
            "https://github.com/settings/appearance/color_mode" &&
          response.status() === 200 &&
          response.request().method() === "POST",
      );
      await this.page.locator(`input#option-${theme}`).check();
      await waitForResponse;
      await this.page.waitForTimeout(1000);
    }

    expect(isSelected).toBe(true);
  }
}
