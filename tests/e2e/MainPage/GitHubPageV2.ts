import type { Locator } from "@playwright/test";
import invariant from "tiny-invariant";
import { ThreadMap } from "./types";
import GitHubPageV1 from "./GitHubPageV1";

type GitHubThread = ThreadMap["github"];

export default class GitHubPageV2 extends GitHubPageV1 {
  protected getThreadContainerImpl(thread: GitHubThread): Locator {
    return this.page
      .getByTestId("review-thread")
      .filter({ has: this.page.locator(`#r${thread.commentIds[0]}`) })
      .first();
  }

  protected getMessageContainerImpl(
    thread: GitHubThread,
    commentIndex: number,
  ): Locator {
    return super
      .getMessageContainerImpl(thread, commentIndex)
      .filter({ visible: true })
      .first();
  }

  protected getReplyInputLocatorImpl(thread: GitHubThread): Locator {
    return this.getThreadContainerImpl(thread)
      .locator("button")
      .filter({ hasText: "Write a reply" })
      .first();
  }

  getNewCommentEditorLocator(): Locator {
    return this.page.locator(
      "[class*='AddCommentEditor-module__AddCommentEditor'], [class*='AddCommentEditor__']",
    );
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
      .getByTestId("comment-header-hamburger")
      .click();
    await this.page
      .getByRole("menuitem", { name: "Edit" })
      .filter({ visible: true })
      .click();
  }

  async openNewThread(): Promise<Locator> {
    const line = this.page
      .locator("td.diff-text-cell[data-diff-side='left'][data-line-number='1']")
      .filter({ visible: true })
      .first();
    await line.hover({ position: { x: 10, y: 10 } });
    await this.page
      .getByRole("button", { name: "Add comment" })
      .filter({ visible: true })
      .first()
      .click();
    return line.locator("[data-marker-navigation-new-thread='true']");
  }

  getPreviewButtonSelector(container: Locator): Locator {
    return container.locator('[role="tab"]', { hasText: "Preview" });
  }

  getWriteButtonSelector(container: Locator): Locator {
    return container.locator('[role="tab"]', { hasText: "Write" });
  }

  async openNewFileThread(): Promise<Locator> {
    await this.page
      .getByRole("button", { name: "Comment on this file" })
      .filter({ visible: true })
      .click();
    return this.page
      .locator(
        "[class*='Diff-module__diffAddFileThread'], [class*='diffAddFileThread__']",
      )
      .filter({ visible: true });
  }
}
