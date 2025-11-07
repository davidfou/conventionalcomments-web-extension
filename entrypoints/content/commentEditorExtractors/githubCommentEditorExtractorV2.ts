import invariant from "tiny-invariant";
import type {
  CommentEditorExtractor,
  OnTextareaExtracted,
} from "./CommentEditorExtractor";

type State = {
  extractedTextareas: Map<HTMLTextAreaElement, string>;
  hiddenTextareas: Set<HTMLTextAreaElement>;
  generateId: () => string;
  onTextareaExtracted: OnTextareaExtracted;
  onTextareaDisposed: (id: string) => void;
};

function handleTextarea(
  textarea: HTMLTextAreaElement,
  {
    hiddenTextareas,
    extractedTextareas,
    generateId,
    onTextareaExtracted,
  }: State,
): void {
  const mainEl = textarea.closest(
    "[class*='InlineMarkers-module__markersWrapper']",
  );
  if (mainEl === null) {
    return;
  }
  const anchorEl = mainEl.querySelector(
    "[class*='InlineAutocomplete-module__container']",
  );
  if (anchorEl === null) {
    return;
  }
  const existingContainers = mainEl.querySelectorAll(
    '[data-testid="ccext-container"]',
  );
  for (const existingContainer of existingContainers) {
    existingContainer.remove();
  }

  if (!textarea.checkVisibility()) {
    hiddenTextareas.add(textarea);
    return;
  }

  const id = generateId();
  onTextareaExtracted({
    id,
    isMainComment:
      textarea.closest("[data-marker-navigation-new-thread='true']") !== null,
    textarea,
    anchor: anchorEl,
    productType: "github-v2",
  });

  extractedTextareas.set(textarea, id);
}

function findTextareas(node: Element, state: State): void {
  const { extractedTextareas, hiddenTextareas } = state;
  const textareas = node
    .querySelectorAll(
      "[class*='InlineMarkers-module__markersWrapper'] textarea",
    )
    .values()
    .filter((el) => el instanceof HTMLTextAreaElement)
    .filter((el) => !extractedTextareas.has(el))
    .filter((el) => !hiddenTextareas.has(el));

  for (const textarea of textareas) {
    handleTextarea(textarea, state);
  }
}

function handleRemovedNode(
  node: Node,
  { extractedTextareas, onTextareaDisposed }: State,
): void {
  const extractedTextareaEntry = extractedTextareas
    .entries()
    .find(([textarea]) => node.contains(textarea));
  if (extractedTextareaEntry === undefined) {
    return;
  }

  onTextareaDisposed(extractedTextareaEntry[1]);
  extractedTextareas.delete(extractedTextareaEntry[0]);
}

function checkTextareaVisibility(state: State): void {
  const { extractedTextareas, hiddenTextareas, onTextareaDisposed } = state;
  const toHideTextareas = extractedTextareas
    .keys()
    .filter((textarea) => !textarea.checkVisibility());
  const toExtractTextareas = hiddenTextareas
    .values()
    .filter((textarea) => textarea.checkVisibility());

  for (const textarea of toHideTextareas) {
    const id = extractedTextareas.get(textarea);
    invariant(id !== undefined);
    onTextareaDisposed(id);
    hiddenTextareas.add(textarea);
  }

  for (const textarea of toExtractTextareas) {
    hiddenTextareas.delete(textarea);
    handleTextarea(textarea, state);
  }
}

function checkMutationForTextarea(
  mutations: MutationRecord[],
  state: State,
): void {
  for (const mutation of mutations) {
    if (mutation.type !== "childList") {
      continue;
    }

    for (const node of mutation.addedNodes) {
      if (!(node instanceof Element)) {
        continue;
      }
      findTextareas(node, state);
    }

    for (const node of mutation.removedNodes) {
      handleRemovedNode(node, state);
    }
  }
}

const githubCommentEditorExtractor: CommentEditorExtractor = (
  generateId,
  onTextareaExtracted,
  onTextareaDisposed,
) => {
  const state: State = {
    extractedTextareas: new Map(),
    hiddenTextareas: new Set(),
    generateId,
    onTextareaExtracted,
    onTextareaDisposed,
  };

  findTextareas(document.body, state);
  const mutationObserver = new MutationObserver((mutations) => {
    checkMutationForTextarea(mutations, state);
  });
  mutationObserver.observe(document.body, { subtree: true, childList: true });
  const hiddenAttributeMutationObserver = new MutationObserver(() => {
    checkTextareaVisibility(state);
  });
  hiddenAttributeMutationObserver.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => {
    mutationObserver.disconnect();
    hiddenAttributeMutationObserver.disconnect();
  };
};

export default githubCommentEditorExtractor;
