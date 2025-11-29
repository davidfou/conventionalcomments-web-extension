import type { Locator, BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { Config } from "../config";
import { Product } from "../types";
import { ThreadMap, CommentsMap } from "./types";
import invariant from "tiny-invariant";

function checkIsCorrectThread<P extends Product>(
  thread: ThreadMap[Product],
  product: P,
): thread is ThreadMap[P] {
  return thread.type === product;
}

function checkIsCorrectComments<P extends Product>(
  comments: CommentsMap[Product],
  product: P,
): comments is CommentsMap[P] {
  return comments.type === product;
}

export abstract class AbstractMainPage<P extends Product> {
  protected product: P;
  protected page: Page;
  protected config: Config;

  constructor(product: P, page: Page, config: Config) {
    this.product = product;
    this.page = page;
    this.config = config;
  }

  async makeScreenshotAssertion(
    theme: string,
    name: string,
    hasPopover: boolean,
  ): Promise<void> {
    if (hasPopover) {
      await expect
        .soft(
          this.page.getByTestId("combobox-options"),
          `the plugin is well integrated (theme ${theme}, test ${name}, popover)`,
        )
        .toHaveScreenshot([theme, `popover_${name}.png`]);
    }

    await expect
      .soft(
        this.getNewCommentEditorLocator(),
        `the plugin is well integrated (theme ${theme}, test ${name}, editor)`,
      )
      .toHaveScreenshot([theme, `editor_${name}.png`]);
  }

  abstract login(): Promise<BrowserContext | null>;
  abstract removeAllThreads(): Promise<void>;

  abstract createThread(
    comments: string[],
    line: number,
  ): Promise<ThreadMap[P]>;
  abstract retrievePullRequestCommentIds(): Promise<CommentsMap[P]>;
  abstract retrieveIssueCommentIds(): Promise<CommentsMap[P]>;

  getThreadContainer(thread: ThreadMap[Product]): Locator {
    invariant(
      checkIsCorrectThread(thread, this.product),
      "Thread type mismatch",
    );
    return this.getThreadContainerImpl(thread);
  }
  protected abstract getThreadContainerImpl(thread: ThreadMap[P]): Locator;

  getMessageContainer(
    thread: ThreadMap[Product],
    commentIndex: number,
  ): Locator {
    invariant(
      checkIsCorrectThread(thread, this.product),
      "Thread type mismatch",
    );
    return this.getMessageContainerImpl(thread, commentIndex);
  }
  protected abstract getMessageContainerImpl(
    thread: ThreadMap[P],
    commentIndex: number,
  ): Locator;

  getReplyInputLocator(thread: ThreadMap[Product]): Locator {
    invariant(
      checkIsCorrectThread(thread, this.product),
      "Thread type mismatch",
    );
    return this.getReplyInputLocatorImpl(thread);
  }
  protected abstract getReplyInputLocatorImpl(thread: ThreadMap[P]): Locator;

  abstract getChangesSelector(): Locator;
  abstract getOverviewSelector(): Locator;
  abstract getPreviewButtonSelector(container: Locator): Locator;
  abstract getWriteButtonSelector(container: Locator): Locator;
  abstract getNewCommentEditorLocator(): Locator;

  async editComment(
    thread: ThreadMap[Product],
    commentIndex: number,
  ): Promise<void> {
    invariant(
      checkIsCorrectThread(thread, this.product),
      "Thread type mismatch",
    );
    await this.editCommentImpl(thread, commentIndex);
  }
  protected abstract editCommentImpl(
    thread: ThreadMap[P],
    commentIndex: number,
  ): Promise<void>;

  async editMainCommentFromPullRequestPage(
    comments: CommentsMap[Product],
  ): Promise<void> {
    invariant(
      checkIsCorrectComments(comments, this.product),
      "Comments type mismatch",
    );
    await this.editMainCommentFromPullRequestPageImpl(comments);
  }
  protected abstract editMainCommentFromPullRequestPageImpl(
    comments: CommentsMap[P],
  ): Promise<void>;

  async editCommentFromPullRequestPage(
    comments: CommentsMap[Product],
    commentIndex: number,
  ): Promise<void> {
    invariant(
      checkIsCorrectComments(comments, this.product),
      "Comments type mismatch",
    );
    await this.editCommentFromPullRequestPageImpl(comments, commentIndex);
  }
  protected abstract editCommentFromPullRequestPageImpl(
    comments: CommentsMap[P],
    commentIndex: number,
  ): Promise<void>;

  abstract editMainCommentFromIssuePage(): Promise<void>;

  async editCommentFromIssuePage(
    comments: CommentsMap[Product],
    commentIndex: number,
  ): Promise<void> {
    invariant(
      checkIsCorrectComments(comments, this.product),
      "Comments type mismatch",
    );
    await this.editCommentFromIssuePageImpl(comments, commentIndex);
  }
  protected abstract editCommentFromIssuePageImpl(
    comments: CommentsMap[P],
    commentIndex: number,
  ): Promise<void>;

  abstract openNewThread(): Promise<Locator>;

  abstract openNewFileThread(): Promise<Locator>;

  abstract waitPageIsReady(): Promise<void>;

  abstract getAvailableThemes(): Promise<string[]>;

  abstract selectTheme(theme: string): Promise<void>;

  async goToMainPage(): Promise<void> {
    await this.page.goto(this.config.mainPageUrl);
    await this.waitPageIsReady();
  }

  async goToOverviewPage(): Promise<void> {
    await this.page.goto(this.config.overviewPageUrl);
    await this.waitPageIsReady();
  }

  async goToIssuePage(): Promise<void> {
    await this.page.goto(this.config.issuePageUrl);
    await this.waitPageIsReady();
  }

  async goToNewPullRequestPage(): Promise<void> {
    await this.page.goto(this.config.newPullRequestPageUrl);
    await this.waitPageIsReady();
  }

  async goToNewIssuePage(): Promise<void> {
    await this.page.goto(this.config.newIssuePageUrl);
    await this.waitPageIsReady();
  }

  async clearLocalStorage(): Promise<void> {
    // localStorage.clear();

    // Temporary workaround to bypass the modal to present the new GitLab interface
    await this.page.evaluate(() => {
      const keysToRemove = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        if (localStorage.key(index) === "showDapWelcomeModal") {
          continue;
        }
        const key = localStorage.key(index);
        if (key === null) {
          throw new Error("Unexpected null key in localStorage");
        }
        keysToRemove.push(key);
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    });
  }
}
