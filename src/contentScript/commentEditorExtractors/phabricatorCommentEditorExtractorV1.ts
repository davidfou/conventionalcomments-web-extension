import type { CommentEditorExtractor } from "./CommentEditorExtractor";

const phabricatorCommentEditorExtractor: CommentEditorExtractor = (
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
      .querySelectorAll(".differential-inline-comment-edit")
      .forEach((parent) => {
        const textarea = parent.querySelector(".remarkup-assist-textarea");
        const buttonAnchorEl = parent.querySelector(
          ".differential-inline-comment-edit-buttons"
        );
        const editorAnchorEl = parent.querySelector(
          ".differential-inline-comment-edit-body"
        );
        if (
          !(textarea instanceof HTMLTextAreaElement) ||
          buttonAnchorEl === null ||
          editorAnchorEl === null
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

        const buttonTargetEl = buttonAnchorEl.parentElement;
        const editorTargetEl = editorAnchorEl.parentElement;
        if (buttonTargetEl === null || editorTargetEl === null) {
          return;
        }

        const id = generateId();

        onTextareaExtracted({
          id,
          isMainComment: parent.closest(".review-thread-reply") === null,
          textarea,
          buttonParams: {
            target: buttonTargetEl,
            anchor: buttonAnchorEl,
          },
          editorParams: {
            target: editorTargetEl,
            anchor: editorAnchorEl,
          },
          productType: "phabricator-v1",
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

export default phabricatorCommentEditorExtractor;
