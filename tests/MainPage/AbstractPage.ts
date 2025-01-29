import type { Page, Locator, BrowserContext } from "@playwright/test";
import config from "config";

import { expect } from "../fixtures";

abstract class AbstractPage {
  public product: string;

  readonly page: Page;

  readonly changesSelector: Locator;

  constructor(product: string, page: Page) {
    this.product = product;
    this.page = page;
    this.changesSelector = page
      .locator(
        `a[href="${config.get<string>(`e2e.${this.product}.mainPage`)}"]`
      )
      .locator("visible=true")
      .first();
  }

  abstract get newCommentEditorLocator(): Locator;

  abstract get textareaLocator(): Locator;

  abstract removeAllThreads(): Promise<void>;

  abstract createThread(
    comments: string[],
    line: number
  ): Promise<{ id: string; noteIds: string[] }>;

  abstract retrievePullRequestCommentIds(): Promise<string[]>;

  abstract retrieveIssueCommentIds(): Promise<string[]>;

  abstract login(): Promise<BrowserContext | null>;

  abstract openNewThread(): Promise<void>;

  abstract editComment(threadId: string, messageId: string): Promise<void>;

  abstract editMainCommentFromPullRequestPage(noteId: string): Promise<void>;

  abstract editCommentFromPullRequestPage(noteId: string): Promise<void>;

  abstract editMainCommentFromIssuePage(): Promise<void>;

  abstract editCommentFromIssuePage(noteId: string): Promise<void>;

  abstract getReplyInputLocator(threadId: string): Locator;

  abstract getMessageContainer(messageId: string): Locator;

  abstract getThreadContainer(threadId: string): Locator;

  abstract waitPageIsReady(): Promise<void>;

  abstract getAvailableThemes(): Promise<string[]>;

  abstract selectTheme(theme: string): Promise<void>;

  async goToMainPage() {
    await this.page.goto(config.get<string>(`e2e.${this.product}.mainPage`));
    await this.waitPageIsReady();
  }

  async goToOverviewPage() {
    await this.page.goto(
      config.get<string>(`e2e.${this.product}.overviewPage`)
    );
    await this.waitPageIsReady();
  }

  async goToIssuePage() {
    await this.page.goto(config.get<string>(`e2e.${this.product}.issuePage`));
    await this.waitPageIsReady();
  }

  async goToNewIssuePage() {
    await this.page.goto(
      config.get<string>(`e2e.${this.product}.newIssuePage`)
    );
    await this.waitPageIsReady();
  }

  async goToNewPullRequestPage() {
    await this.page.goto(
      config.get<string>(`e2e.${this.product}.newPullRequestPage`)
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
}

export default AbstractPage;
