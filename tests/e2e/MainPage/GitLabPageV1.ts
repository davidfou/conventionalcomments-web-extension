import type { Page, Locator } from "@playwright/test";
import { AbstractMainPage } from "./AbstractMainPage";
import type { Config } from "../config";
import { Gitlab } from "@gitbeaker/rest";
import invariant from "tiny-invariant";
import { CommentsMap, ThreadMap } from "./types";

type GitLabThread = ThreadMap["gitlab"];
type GitLabComments = CommentsMap["gitlab"];

export default class GitLabPageV1 extends AbstractMainPage<"gitlab"> {
  private apiClient: InstanceType<typeof Gitlab<true>>;
  private projectPath: string;

  constructor(page: Page, config: Config) {
    super("gitlab", page, config);
    this.apiClient = new Gitlab({ token: config.token, camelize: true });
    this.projectPath = `${config.username}/${config.project}`;
  }

  async login(): Promise<null> {
    await this.page.goto("https://gitlab.com/");
    invariant(
      this.page.url() === "https://gitlab.com/",
      "Authenticate user by running the script devScripts/getGitLabCookies.ts",
    );
    return null;
  }

  async removeAllThreads(): Promise<void> {
    const notes = await this.apiClient.MergeRequestNotes.all(
      this.projectPath,
      1,
    );
    await Promise.all(
      notes
        .filter(({ type }) => type === "DiffNote")
        .map(({ id }) =>
          this.apiClient.MergeRequestNotes.remove(this.projectPath, 1, id),
        ),
    );
  }

  async createThread(comments: string[], line: number): Promise<GitLabThread> {
    const [baseComment, ...replies] = comments;
    const mergeRequest = await this.apiClient.MergeRequests.show(
      this.projectPath,
      1,
    );

    const discussion = await this.apiClient.MergeRequestDiscussions.create(
      this.projectPath,
      1,
      baseComment,
      {
        position: {
          baseSha: mergeRequest.diffRefs.baseSha,
          startSha: mergeRequest.diffRefs.startSha,
          headSha: mergeRequest.diffRefs.headSha,
          positionType: "text",
          oldPath: "README.md",
          newPath: "README.md",
          oldLine: line.toString(),
        },
      },
    );

    const firstNote = discussion.notes?.[0];
    invariant(
      firstNote !== undefined,
      "Expected discussion to have at least one note",
    );

    const noteIds = [firstNote.id];
    let previousNoteId = firstNote.id;
    for (const reply of replies) {
      const note = await this.apiClient.MergeRequestDiscussions.addNote(
        this.projectPath,
        1,
        discussion.id,
        previousNoteId,
        reply,
      );
      previousNoteId = note.id;
      noteIds.push(note.id);
    }

    return { type: "gitlab", id: discussion.id, noteIds };
  }

  async retrievePullRequestCommentIds(): Promise<GitLabComments> {
    const notes = await this.apiClient.MergeRequestNotes.all(
      this.projectPath,
      1,
    );
    return {
      type: "gitlab",
      noteIds: notes
        .filter(({ type, system }) => type === null && !system)
        .map(({ id }) => id.toString()),
    };
  }

  async retrieveIssueCommentIds(): Promise<GitLabComments> {
    const notes = await this.apiClient.IssueNotes.all(this.projectPath, 1);
    return {
      type: "gitlab",
      noteIds: notes.map(({ id }) => id.toString()),
    };
  }

  protected getThreadContainerImpl(thread: GitLabThread): Locator {
    return this.page.locator(
      `*[data-testid='discussion-content'][data-discussion-id=${JSON.stringify(
        thread.id,
      )}]`,
    );
  }

  private getNoteContainerSelector(
    thread: GitLabThread,
    commentIndex: number,
  ): Locator {
    const noteId = thread.noteIds.at(commentIndex);
    invariant(noteId !== undefined, "The thread has no note at this index.");
    return (
      thread.id === "" ? this.page : this.getThreadContainerImpl(thread)
    ).locator(
      `*[data-testid='noteable-note-container'][data-note-id=${JSON.stringify(
        noteId.toString(),
      )}]`,
    );
  }

  protected getMessageContainerImpl(
    thread: GitLabThread,
    commentIndex: number,
  ): Locator {
    return this.getNoteContainerSelector(thread, commentIndex);
  }

  protected getReplyInputLocatorImpl(thread: GitLabThread): Locator {
    return this.getThreadContainerImpl(thread).locator(
      "*[data-testid='discussion-reply-tab']",
    );
  }

  getChangesSelector(): Locator {
    return this.page.locator(`a[href="${this.config.mainPageUrl}"]`);
  }

  getOverviewSelector(): Locator {
    return this.page
      .locator("main")
      .locator(`a[href="${this.config.overviewPageUrl}"]`);
  }

  private getNoteEditSelector(
    thread: GitLabThread,
    commentIndex: number,
  ): Locator {
    return this.getNoteContainerSelector(thread, commentIndex).locator(
      "*[data-testid='note-edit-button']",
    );
  }

  protected async editCommentImpl(
    thread: GitLabThread,
    commentIndex: number,
  ): Promise<void> {
    await this.getNoteEditSelector(thread, commentIndex).click();
  }

  protected async editMainCommentFromPullRequestPageImpl(): Promise<void> {
    await this.page.goto(`/${this.projectPath}/-/merge_requests/1/edit`);
  }

  private async editCommentFromPage(
    comments: GitLabComments,
    commentIndex: number,
  ): Promise<void> {
    const noteId = comments.noteIds.at(commentIndex);
    invariant(noteId !== undefined, "The thread has no note at this index.");
    await this.page
      .locator(`#note_${noteId}`)
      .locator("*[data-testid=note-edit-button]")
      .click();
  }

  protected async editCommentFromPullRequestPageImpl(
    comments: GitLabComments,
    commentIndex: number,
  ): Promise<void> {
    await this.editCommentFromPage(comments, commentIndex);
  }

  async editMainCommentFromIssuePage(): Promise<void> {
    await this.page
      .locator("*[data-testid='work-item-edit-form-button']")
      .click();
  }

  protected async editCommentFromIssuePageImpl(
    comments: GitLabComments,
    commentIndex: number,
  ): Promise<void> {
    await this.editCommentFromPage(comments, commentIndex);
    return;
  }

  async openNewThread(): Promise<Locator> {
    await this.page
      .locator("#diffs")
      .locator(
        "*[data-testid=left-side][data-interop-type=old][data-interop-line='1'][data-interop-old-line='1']",
      )
      .locator("*[data-testid='left-comment-button']")
      .click();
    return this.page.locator("form[data-line-code$='_1_1']");
  }

  async waitPageIsReady(): Promise<void> {
    await this.page.locator("body.page-initialised").waitFor();
  }

  getPreviewButtonSelector(container: Locator): Locator {
    return container.locator("*[data-testid='preview-toggle']");
  }

  getWriteButtonSelector(container: Locator): Locator {
    return container.locator("*[data-testid='preview-toggle']");
  }

  getNewCommentEditorLocator(): Locator {
    return this.page.locator(".edit-note");
  }

  getAvailableThemes(): Promise<string[]> {
    return Promise.resolve(["Light", "Dark"]);
  }

  async selectTheme(theme: string): Promise<void> {
    await this.page.goto("https://gitlab.com/-/profile/preferences");
    await this.waitPageIsReady();

    const currentValue = await this.page
      .locator("div.gl-form-radio")
      .filter({
        has: this.page.locator("input[name='user[color_mode_id]']:checked"),
      })
      .locator("label")
      .textContent();

    if (currentValue === theme) {
      return;
    }

    const waitForResponse = this.page.waitForResponse(
      (response) =>
        response.url() === "https://gitlab.com/-/profile/preferences" &&
        response.status() === 200 &&
        response.request().method() === "POST",
    );
    await this.page
      .locator("div.gl-form-radio")
      .filter({
        has: this.page.locator("input[name='user[color_mode_id]']"),
      })
      .filter({
        hasText: theme,
      })
      .locator("label")
      .click();
    await waitForResponse;

    await this.waitPageIsReady();
  }
}
