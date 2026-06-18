import type { Locator } from "@playwright/test";
import invariant from "tiny-invariant";
import GitLabPageV1 from "./GitLabPageV1";
import type { ThreadMap } from "./types";

type GitLabThread = ThreadMap["gitlab"];

export default class GitLabPageV2 extends GitLabPageV1 {
  protected getMessageContainerImpl(
    thread: GitLabThread,
    commentIndex: number,
  ): Locator {
    const noteId = thread.noteIds.at(commentIndex);
    invariant(noteId !== undefined, "The thread has no note at this index.");
    return (
      thread.id === "" ? this.page : this.getThreadContainerImpl(thread)
    ).locator(
      `*[data-testid='noteable-note-container']#note_${String(noteId)}`,
    );
  }

  protected async editCommentImpl(
    thread: GitLabThread,
    commentIndex: number,
  ): Promise<void> {
    await this.getMessageContainerImpl(thread, commentIndex)
      .locator("*[data-testid='pencil-icon']")
      .first()
      .click();
  }

  async openNewThread(): Promise<Locator> {
    await this.page
      .locator("a.rd-line-link[aria-label='Removed line 1']")
      .hover();
    await this.page.locator("button.rd-new-discussion-toggle").click();
    return this.page.locator("tr.rd-discussion-row form.edit-note");
  }

  async openNewFileThread(): Promise<Locator> {
    await this.page.locator("*[data-testid=comment-files-button]").click();
    return this.page.locator(
      "*[data-testid='file-discussions'] form.edit-note",
    );
  }
}
