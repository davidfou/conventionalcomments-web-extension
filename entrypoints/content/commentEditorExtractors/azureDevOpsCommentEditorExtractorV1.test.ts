// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import azureDevOpsV1 from "./azureDevOpsCommentEditorExtractorV1";
import type { OnTextareaExtracted } from "./CommentEditorExtractor";

// jsdom doesn't implement checkVisibility
HTMLElement.prototype.checkVisibility = (): boolean => true;

function createEditor(textareaClass: string): string {
  return `
    <div class="flex-column flex-grow rhythm-vertical-4 repos-comment-editor-fit repos-comment-editor-max-width">
      <div class="repos-attachments-drop-target relative">
        <div>
          <div class="flex-column">
            <div class="flex-column">
              <div class="bolt-textfield flex-row flex-center focus-treatment">
                <div class="flex-row flex-grow relative">
                  <textarea class="bolt-textfield-auto-adjust-hidden ${textareaClass}"></textarea>
                  <textarea class="${textareaClass}"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

const NEW_THREAD_CLASSES =
  "threadId--1 bolt-textfield-input flex-grow bolt-textfield-auto-adjust";
const REPLY_CLASSES =
  "bolt-textfield-input flex-grow bolt-textfield-auto-adjust";

describe("azureDevOpsCommentEditorExtractorV1", () => {
  let idCounter: number;
  let onTextareaExtracted: ReturnType<typeof vi.fn<OnTextareaExtracted>>;
  let cleanup: (() => void) | null;

  function start(): void {
    cleanup = azureDevOpsV1(
      () => {
        idCounter += 1;
        return `id-${idCounter}`;
      },
      onTextareaExtracted,
      vi.fn(),
    );
  }

  beforeEach(() => {
    idCounter = 0;
    onTextareaExtracted = vi.fn<OnTextareaExtracted>();
    cleanup = null;
  });

  afterEach(() => {
    cleanup?.();
    document.body.innerHTML = "";
  });

  it("extracts the editor of a new thread as a main comment", () => {
    document.body.innerHTML = createEditor(NEW_THREAD_CLASSES);
    start();

    expect(onTextareaExtracted).toHaveBeenCalledTimes(1);
    const [extracted] = onTextareaExtracted.mock.calls[0];
    expect(extracted.productType).toBe("azure-devops-v1");
    expect(extracted.isMainComment).toBe(true);
    expect(
      extracted.textarea.classList.contains(
        "bolt-textfield-auto-adjust-hidden",
      ),
    ).toBe(false);
    expect(extracted.anchor.classList.contains("bolt-textfield")).toBe(true);
  });

  it("extracts the editor of a reply as a non-main comment", () => {
    document.body.innerHTML = createEditor(REPLY_CLASSES);
    start();

    expect(onTextareaExtracted).toHaveBeenCalledTimes(1);
    expect(onTextareaExtracted.mock.calls[0][0].isMainComment).toBe(false);
  });

  it("extracts editors added after start", async () => {
    start();
    document.body.insertAdjacentHTML("beforeend", createEditor(REPLY_CLASSES));

    await vi.waitFor(() => {
      expect(onTextareaExtracted).toHaveBeenCalledTimes(1);
    });
  });

  it("ignores GitHub and GitLab editors", () => {
    document.body.innerHTML = `
      <form><div class="div-dropzone"><textarea id="note_note"></textarea></div></form>
      <div class="js-previewable-comment-form"><textarea></textarea></div>`;
    start();

    expect(onTextareaExtracted).not.toHaveBeenCalled();
  });
});
