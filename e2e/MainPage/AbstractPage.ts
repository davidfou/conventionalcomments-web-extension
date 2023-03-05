import type { Page } from "@playwright/test";
import config from "config";

import { expect } from "../fixtures";

abstract class AbstractPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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

  async goToMainPage() {
    await this.page.goto(config.get<string>("codeceptjs.current.mainPage"));
  }

  async goToOverviewPage() {
    await this.page.goto(config.get<string>("codeceptjs.current.overviewPage"));
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
