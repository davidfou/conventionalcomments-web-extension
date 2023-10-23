import type { Page, Locator, BrowserContext } from "@playwright/test";
import config from "config";

import { expect } from "../fixtures";

abstract class AbstractPage<T, U> {
  public product: string;

  readonly page: Page;

  readonly textareaLocator: Locator;

  readonly changesSelector: Locator;

  readonly newCommentEditorSelector: Locator;

  constructor(
    product: string,
    page: Page,
    textareaLocator: Locator,
    newCommentEditorSelector: Locator
  ) {
    this.product = product;
    this.page = page;
    this.textareaLocator = textareaLocator;
    this.changesSelector = page
      .locator(
        `a[href="${config.get<string>(`codeceptjs.${this.product}.mainPage`)}"]`
      )
      .locator("visible=true")
      .first();
    this.newCommentEditorSelector = newCommentEditorSelector;
  }

  abstract removeAllThreads(): Promise<void>;

  abstract createThread(
    comments: string[],
    line: number
  ): Promise<{ id: T; noteIds: U[] }>;

  abstract retrievePullRequestCommentIds(): Promise<T[]>;

  abstract retrieveIssueCommentIds(): Promise<T[]>;

  abstract login(): Promise<BrowserContext | null>;

  abstract openNewThread(): Promise<void>;

  abstract editComment(threadId: T, noteId: U): Promise<void>;

  abstract editCommentFromMainPage(
    noteId: number,
    pageType?: "pullRequestDescription" | "issueDescription"
  ): Promise<void>;

  abstract getReplyInputLocator(threadId: T): Locator;

  abstract getMessageContainer(messageId: U): Locator;

  abstract getThreadContainer(threadId: T): Locator;

  abstract waitPageIsReady(): Promise<void>;

  abstract getAvailableThemes(): Promise<string[]>;

  abstract selectTheme(theme: string): Promise<void>;

  async goToMainPage() {
    await this.page.goto(
      config.get<string>(`codeceptjs.${this.product}.mainPage`)
    );
    await this.waitPageIsReady();
  }

  async goToOverviewPage() {
    await this.page.goto(
      config.get<string>(`codeceptjs.${this.product}.overviewPage`)
    );
    await this.waitPageIsReady();
  }

  async goToIssuePage() {
    await this.page.goto(
      config.get<string>(`codeceptjs.${this.product}.issuePage`)
    );
    await this.waitPageIsReady();
  }

  async goToNewIssuePage() {
    await this.page.goto(
      config.get<string>(`codeceptjs.${this.product}.newIssuePage`)
    );
    await this.waitPageIsReady();
  }

  async goToNewPullRequestPage() {
    await this.page.goto(
      config.get<string>(`codeceptjs.${this.product}.newPullRequestPage`)
    );
    await this.waitPageIsReady();
  }

  async setSelectionRange(start: number, end: number) {
    const isCorrect = await this.page.evaluate(
      (position) => {
        const element = document.activeElement;
        if (element === null) {
          return "No active element";
        }
        if (element.tagName !== "TEXTAREA") {
          return `Active element tag name to be TEXTAREA, got ${element.tagName}`;
        }
        (<HTMLTextAreaElement>element).setSelectionRange(
          position.start,
          position.end
        );
        return null;
      },
      { start, end }
    );
    expect(isCorrect).toBeNull();
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }

  async injectStyleBeforeScreenshot() {
    await this.page.addStyleTag({
      content: [
        "* {",
        "  caret-color: transparent !important;",
        "  transition-property: none !important;",
        "}",
      ].join("\n"),
    });
  }
}

export default AbstractPage;
