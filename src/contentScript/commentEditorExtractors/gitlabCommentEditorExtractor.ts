import type { CommentEditorExtractor } from "./CommentEditorExtractor";

const getIsMainComment = (el: Element): boolean => {
  const mainCommentEl = el
    .closest(".discussion-notes")
    ?.querySelector("li[data-qa-selector=noteable_note_container]");
  return (
    mainCommentEl === null ||
    mainCommentEl === el.closest("li[data-qa-selector=noteable_note_container]")
  );
};

const gitlabCommentEditorExtractor: CommentEditorExtractor = (
  generateId,
  onTextareaExtracted,
  onTextareaDisposed
) => {
  const extractedTextareas: {
    id: string;
    textarea: HTMLTextAreaElement;
  }[] = [];

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type !== "childList") {
        return;
      }

      mutation.addedNodes.forEach((textarea) => {
        if (
          !(textarea instanceof HTMLTextAreaElement) ||
          textarea.id !== "note_note"
        ) {
          return;
        }
        const mainEl = textarea.closest("form");
        const fileContainer = textarea.closest(".file-holder");
        if (mainEl === null || fileContainer === null) {
          return;
        }
        const id = generateId();

        const navList = mainEl.querySelector(
          "[data-testid='md-header-toolbar']"
        );
        const targetEl = mainEl.querySelector(".div-dropzone-wrapper");
        const anchorEl = mainEl.querySelector(".div-dropzone");
        const buttonAnchorEl = mainEl.querySelector(
          "[data-testid='md-header-toolbar'] > button:last-child"
        );
        if (
          navList === null ||
          targetEl === null ||
          anchorEl === null ||
          buttonAnchorEl === null
        ) {
          return;
        }

        onTextareaExtracted({
          id,
          isMainComment: getIsMainComment(mainEl),
          textarea,
          buttonParams: {
            target: navList,
            anchor: buttonAnchorEl,
          },
          editorParams: {
            target: targetEl,
            anchor: anchorEl,
          },
          productType: "gitlab",
        });
        navList.insertBefore(document.createTextNode(" "), buttonAnchorEl);

        extractedTextareas.push({ id, textarea });
      });

      mutation.removedNodes.forEach((node) => {
        const index = extractedTextareas.findIndex(({ textarea }) =>
          node.contains(textarea)
        );

        if (index === -1) {
          return;
        }

        const { id } = extractedTextareas[index];
        extractedTextareas.splice(index, 1);
        onTextareaDisposed(id);
      });
    });
  });
  mutationObserver.observe(document.body, { subtree: true, childList: true });
  return mutationObserver.disconnect.bind(mutationObserver);
};

export default gitlabCommentEditorExtractor;
