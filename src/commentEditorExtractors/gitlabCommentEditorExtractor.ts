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

  new MutationObserver((mutations) => {
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
        if (mainEl === null) {
          return;
        }
        const id = generateId();

        const navList = mainEl.querySelector(".nav-links > .md-header-toolbar");
        const targetEl = mainEl.querySelector(".div-dropzone-wrapper");
        const anchorEl = mainEl.querySelector(".div-dropzone");
        if (navList === null || targetEl === null || anchorEl === null) {
          return;
        }

        const navItem = document.createElement("div");
        navItem.classList.add("d-inline-block", "ml-md-2", "ml-0");

        const lastItem = navList.childNodes[navList.childNodes.length - 1];
        navList.insertBefore(navItem, lastItem);
        navList.insertBefore(document.createTextNode(" "), lastItem);

        onTextareaExtracted({
          id,
          isMainComment: getIsMainComment(mainEl),
          textarea,
          buttonParams: {
            target: navItem,
          },
          editorParams: {
            target: targetEl,
            anchor: anchorEl,
          },
        });
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
  }).observe(document.body, { subtree: true, childList: true });
};

export default gitlabCommentEditorExtractor;
