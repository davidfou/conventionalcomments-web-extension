import type { Page, Locator } from "@playwright/test";
import config from "config";

import { expect } from "../fixtures";

abstract class AbstractPage {
  private product: string;

  readonly page: Page;

  readonly textareaLocator: Locator;

  readonly changesSelector: Locator;

  constructor(product: string, page: Page, textareaLocator: Locator) {
    this.product = product;
    this.page = page;
    this.textareaLocator = textareaLocator;
    this.changesSelector = page
      .locator(
        `a[href="${config.get<string>(`codeceptjs.${this.product}.mainPage`)}"]`
      )
      .first();
  }

  abstract removeAllThreads(): Promise<void>;

  abstract createThread(
    comments: string[],
    line: number
  ): Promise<{ id: number; noteIds: number[] }>;

  abstract retrievePullRequestCommentIds(): Promise<string[]>;

  abstract retrieveIssueCommentIds(): Promise<string[]>;

  abstract login(): Promise<void>;

  abstract openNewThread(): Promise<void>;

  abstract editComment(threadId: number, noteId: number): Promise<void>;

  abstract editCommentFromMainPage(threadId: string): Promise<void>;

  abstract getReplyInputLocator(threadId: number): Locator;

  abstract getMessageContainer(messageId: number): Locator;

  abstract getThreadContainer(threadId: number): Locator;

  abstract waitPageIsReady(): Promise<void>;

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

  async getSelectedText() {
    const position = await this.page.evaluate(
      (): string | { start: number; end: number } => {
        const element = document.activeElement;
        if (element === null) {
          return "No active element";
        }
        if (element.tagName !== "TEXTAREA") {
          return `Active element tag name to be TEXTAREA, got ${element.tagName}`;
        }
        const elementTextarea = <HTMLTextAreaElement>element;
        return {
          start: elementTextarea.selectionStart,
          end: elementTextarea.selectionEnd,
        };
      }
    );
    if (typeof position === "string") {
      throw new Error(position);
    }
    return position;
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }
}

export default AbstractPage;
