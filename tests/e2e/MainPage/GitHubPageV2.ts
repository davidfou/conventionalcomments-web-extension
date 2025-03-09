import type { Locator } from "@playwright/test";
import invariant from "tiny-invariant";
import { ThreadMap } from "./types";
import GitHubPageV1 from "./GitHubPageV1";

type GitHubThread = ThreadMap["github"];

export default class GitHubPageV2 extends GitHubPageV1 {
  protected getThreadContainerImpl(thread: GitHubThread): Locator {
    return this.page
      .getByTestId("review-thread")
      .filter({ has: this.getMessageContainerImpl(thread, 0) });
  }

  protected getReplyInputLocatorImpl(thread: GitHubThread): Locator {
    return this.getThreadContainerImpl(thread).locator(
      "[data-marker-navigation-comment-id$='reply-comment']",
    );
  }

  getNewCommentEditorLocator(): Locator {
    return this.page.locator(
      "[class^='AddCommentEditor-module__AddCommentEditor--']",
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
    await this.page.getByRole("menuitem", { name: "Edit" }).click();
  }

  async openNewThread(): Promise<Locator> {
    const line = this.page.locator("[data-grid-cell-id$='1-0-2']");
    await line.hover();
    await line.locator("[data-add-comment-button='true']").click();
    return line.locator("[data-marker-navigation-new-thread='true']");
  }
}
