import type { Locator } from "@playwright/test";
import invariant from "tiny-invariant";
import GitLabPageV1 from "./GitLabPageV1";
import type { ThreadMap } from "./types";
import { expect } from "../fixtures";

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
    const noteId = thread.noteIds.at(commentIndex);
    invariant(noteId !== undefined, "The thread has no note at this index.");
    await this.getMessageContainerImpl(thread, commentIndex)
      .locator(
        `xpath=.//button[@aria-label='Edit comment' and ancestor::*[@data-testid='noteable-note-container'][1][@id="note_${String(noteId)}"]]`,
      )
      .click();
  }

  async openNewThread(): Promise<Locator> {
    const line = this.page.locator(
      "td.rd-line-number[data-position='old'][data-change='removed'] a.rd-line-link[data-line-number='1']",
    );
    const row = this.page.locator("tr").filter({ has: line });
    await row.evaluate((element) =>
      element.scrollIntoView({ block: "center" }),
    );
    const newDiscussionButton = row.getByTestId("new_discussion_toggle");
    await expect(async () => {
      await this.page.mouse.move(0, 0);
      await line.hover();
      await expect(newDiscussionButton).toBeVisible({ timeout: 200 });
    }).toPass();
    await newDiscussionButton.click();
    return this.page.locator("tr.rd-discussion-row form.edit-note");
  }

  async openNewFileThread(): Promise<Locator> {
    await this.page.locator("*[data-testid=comment-files-button]").click();
    return this.page.locator(
      "*[data-testid='file-discussions'] form.edit-note",
    );
  }
}
