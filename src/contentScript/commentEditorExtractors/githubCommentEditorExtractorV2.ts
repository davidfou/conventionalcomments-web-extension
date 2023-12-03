import type { CommentEditorExtractor } from "./CommentEditorExtractor";

const githubCommentEditorExtractor: CommentEditorExtractor = (
  generateId,
  onTextareaExtracted,
  onTextareaDisposed
) => {
  const extractedTextareas: {
    id: string;
    textarea: HTMLTextAreaElement;
  }[] = [];

  const handleNewTextarea = (node: Element) => {
    node
      .querySelectorAll(".js-previewable-comment-form textarea")
      .forEach((textarea) => {
        if (!(textarea instanceof HTMLTextAreaElement)) {
          return;
        }
        const form = textarea.closest("form");
        if (
          form === null ||
          (!form.classList.contains("js-comment-update") &&
            !form.classList.contains("js-inline-comment-form")) ||
          form.id !== ""
        ) {
          return;
        }
        if (
          extractedTextareas.some(
            (extractedTextarea) => extractedTextarea.textarea === textarea
          )
        ) {
          return;
        }

        if (
          textarea.closest("#js-inline-comments-single-container-template") !==
          null
        ) {
          return;
        }

        const mainEl = textarea.closest(".js-previewable-comment-form");
        if (mainEl === null) {
          return;
        }
        const buttonAnchorEl = mainEl.querySelector(
          "markdown-toolbar slash-command-toolbar-button"
        );
        const editorAnchorEl = mainEl.querySelector("file-attachment");
        if (buttonAnchorEl === null || editorAnchorEl === null) {
          return;
        }

        const buttonTargetEl = buttonAnchorEl.parentElement;
        const editorTargetEl = editorAnchorEl.parentElement;
        if (buttonTargetEl === null || editorTargetEl === null) {
          return;
        }

        const id = generateId();

        onTextareaExtracted({
          id,
          isMainComment: textarea.closest(".review-thread-reply") === null,
          textarea,
          buttonParams: {
            target: buttonTargetEl,
            anchor: buttonAnchorEl,
          },
          editorParams: {
            target: editorTargetEl,
            anchor: editorAnchorEl,
          },
          productType: "github-v2",
        });

        extractedTextareas.push({
          id,
          textarea,
        });
      });
  };

  handleNewTextarea(document.body);
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type !== "childList") {
        return;
      }

      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) {
          return;
        }
        handleNewTextarea(node);
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

export default githubCommentEditorExtractor;
