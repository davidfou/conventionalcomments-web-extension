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
      .querySelectorAll(
        "[class*='InlineMarkers-module__markersWrapper'] textarea"
      )
      .forEach((textarea) => {
        console.log("textarea", textarea);
        if (!(textarea instanceof HTMLTextAreaElement)) {
          return;
        }

        if (
          extractedTextareas.some(
            (extractedTextarea) => extractedTextarea.textarea === textarea
          )
        ) {
          return;
        }

        const mainEl = textarea.closest(
          "[class*='InlineMarkers-module__markersWrapper']"
        );
        if (mainEl === null) {
          return;
        }
        const buttonTargetEl = mainEl.querySelector(
          "[class*='Toolbar-module__toolbar']"
        );

        const editorTargetEl = mainEl.querySelector(
          "[class*='MarkdownEditor-module__inputWrapper']"
        );

        if (buttonTargetEl === null || editorTargetEl === null) {
          return;
        }

        const editorAnchorEl = mainEl.querySelector(
          "[class*='InlineAutocomplete-module__container']"
        );
        if (editorAnchorEl === null) {
          return;
        }

        const id = generateId();

        console.log("textarea params", {
          id,
          isMainComment: true,
          textarea,
          buttonParams: {
            target: buttonTargetEl,
            anchor: undefined,
          },
          editorParams: {
            target: editorTargetEl,
            anchor: editorAnchorEl,
          },
          productType: "github-v3",
        });

        onTextareaExtracted({
          id,
          isMainComment: true,
          textarea,
          buttonParams: {
            target: buttonTargetEl,
            anchor: undefined,
          },
          editorParams: {
            target: editorTargetEl,
            anchor: editorAnchorEl,
          },
          productType: "github-v3",
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
