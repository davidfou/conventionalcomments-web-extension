import type { CommentEditorExtractor } from "./CommentEditorExtractor";

function getIsMainComment(el: Element): boolean {
  const mainCommentEl =
    el
      .closest(".discussion-notes")
      ?.querySelector("li[data-testid='noteable-note-container']") ?? null;
  return (
    mainCommentEl === null ||
    mainCommentEl === el.closest("li[data-testid='noteable-note-container']")
  );
}

function handleTextarea(
  textarea: HTMLTextAreaElement,
): null | { mainEl: Element; anchorEl: Element } {
  if (textarea.id !== "note_note") {
    return null;
  }
  const mainEl = textarea.closest("form");
  const fileContainer = textarea.closest(".file-holder");
  if (mainEl === null || fileContainer === null) {
    return null;
  }
  const anchorEl = mainEl.querySelector(".div-dropzone");
  if (anchorEl === null) {
    return null;
  }

  return { mainEl, anchorEl };
}

function handleMutations(mutation: MutationRecord): {
  textareas: HTMLTextAreaElement[];
  removedNodes: Node[];
} {
  if (mutation.type !== "childList") {
    return { textareas: [], removedNodes: [] };
  }

  const textareas = mutation.addedNodes
    .values()
    .filter((el) => el instanceof HTMLTextAreaElement);

  return {
    textareas: Array.from(textareas),
    removedNodes: Array.from(mutation.removedNodes),
  };
}

const gitlabCommentEditorExtractor: CommentEditorExtractor = (
  generateId,
  onTextareaExtracted,
  onTextareaDisposed,
) => {
  const extractedTextareas: { id: string; textarea: HTMLTextAreaElement }[] =
    [];

  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const { textareas, removedNodes } = handleMutations(mutation);

      for (const textarea of textareas) {
        const elements = handleTextarea(textarea);
        if (elements === null) {
          continue;
        }
        const { mainEl, anchorEl } = elements;

        const id = generateId();
        onTextareaExtracted({
          id,
          isMainComment: getIsMainComment(mainEl),
          textarea,
          anchor: anchorEl,
          productType: "gitlab-v1",
        });

        extractedTextareas.push({ id, textarea });
      }

      for (const node of removedNodes) {
        const index = extractedTextareas.findIndex(({ textarea }) =>
          node.contains(textarea),
        );

        if (index === -1) {
          continue;
        }

        const { id } = extractedTextareas[index];
        extractedTextareas.splice(index, 1);
        onTextareaDisposed(id);
      }
    }
  });
  mutationObserver.observe(document.body, { subtree: true, childList: true });
  return mutationObserver.disconnect.bind(mutationObserver);
};

export default gitlabCommentEditorExtractor;
