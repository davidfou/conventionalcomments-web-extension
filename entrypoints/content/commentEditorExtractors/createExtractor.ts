import invariant from "tiny-invariant";
import type {
  CommentEditorExtractor,
  OnTextareaExtracted,
} from "./CommentEditorExtractor";
import type { ProductType } from "../types";

export type PlatformConfig = {
  productType: ProductType;

  // Find textareas within document.body on init or within a mutation-added node
  findTextareasInNode: (node: Node) => HTMLTextAreaElement[];

  // Validate textarea and extract its container + anchor elements
  // Returns null if the textarea should be skipped
  extractElements: (
    textarea: HTMLTextAreaElement,
  ) => { mainEl: Element; anchorEl: Element } | null;

  // Determine if textarea is for a main comment vs a reply
  isMainComment: (textarea: HTMLTextAreaElement, mainEl: Element) => boolean;

  // Optional: a single visibility observer that watches for attribute changes
  // and triggers a visibility recheck on all tracked textareas.
  // Omit for platforms where textareas are never hidden after creation.
  visibility?: {
    target: Element;
    observerInit: MutationObserverInit;
  };
};

type State = {
  extractedTextareas: Map<HTMLTextAreaElement, string>;
  hiddenTextareas: Set<HTMLTextAreaElement>;
  generateId: () => string;
  onTextareaExtracted: OnTextareaExtracted;
  onTextareaDisposed: (id: string) => void;
  config: PlatformConfig;
};

function cleanupExistingContainers(container: Element): void {
  const existingContainers = container.querySelectorAll(
    '[data-testid="ccext-container"]',
  );
  for (const existingContainer of existingContainers) {
    existingContainer.remove();
  }
}

function handleTextarea(textarea: HTMLTextAreaElement, state: State): void {
  const { extractedTextareas, hiddenTextareas, config } = state;

  if (extractedTextareas.has(textarea) || hiddenTextareas.has(textarea)) {
    return;
  }

  const elements = config.extractElements(textarea);
  if (elements === null) {
    return;
  }

  const { mainEl, anchorEl } = elements;
  cleanupExistingContainers(mainEl);

  if (!textarea.checkVisibility()) {
    hiddenTextareas.add(textarea);
    return;
  }

  const id = state.generateId();
  extractedTextareas.set(textarea, id);
  state.onTextareaExtracted({
    id,
    isMainComment: config.isMainComment(textarea, mainEl),
    textarea,
    anchor: anchorEl,
    productType: config.productType,
  });
}

function checkTextareaVisibility(state: State): void {
  const { extractedTextareas, hiddenTextareas, onTextareaDisposed } = state;

  const toHide = extractedTextareas
    .keys()
    .filter((textarea) => !textarea.checkVisibility());
  const toShow = hiddenTextareas
    .values()
    .filter((textarea) => textarea.checkVisibility());

  for (const textarea of toHide) {
    const id = extractedTextareas.get(textarea);
    invariant(id !== undefined);
    onTextareaDisposed(id);
    extractedTextareas.delete(textarea);
    hiddenTextareas.add(textarea);
  }

  for (const textarea of toShow) {
    hiddenTextareas.delete(textarea);
    handleTextarea(textarea, state);
  }
}

function findAndHandleTextareas(node: Node, state: State): void {
  const textareas = state.config
    .findTextareasInNode(node)
    .filter(
      (el) =>
        !state.extractedTextareas.has(el) && !state.hiddenTextareas.has(el),
    );
  for (const textarea of textareas) {
    handleTextarea(textarea, state);
  }
}

function handleRemovedNode(node: Node, state: State): void {
  const { extractedTextareas, hiddenTextareas, onTextareaDisposed } = state;

  // Check extracted textareas
  const extractedEntry = extractedTextareas
    .entries()
    .find(([textarea]) => node.contains(textarea));
  if (extractedEntry !== undefined) {
    onTextareaDisposed(extractedEntry[1]);
    extractedTextareas.delete(extractedEntry[0]);
    return;
  }

  // Check hidden textareas (fixes pre-existing leak where hidden textareas
  // that were removed from the DOM were never cleaned up)
  const hiddenTextarea = hiddenTextareas
    .values()
    .find((textarea) => node.contains(textarea));
  if (hiddenTextarea !== undefined) {
    hiddenTextareas.delete(hiddenTextarea);
  }
}

function handleMutations(mutations: MutationRecord[], state: State): void {
  for (const mutation of mutations) {
    if (mutation.type !== "childList") {
      continue;
    }

    for (const node of mutation.addedNodes) {
      findAndHandleTextareas(node, state);
    }

    for (const node of mutation.removedNodes) {
      handleRemovedNode(node, state);
    }
  }
}

export default function createExtractor(
  config: PlatformConfig,
): CommentEditorExtractor {
  return (generateId, onTextareaExtracted, onTextareaDisposed) => {
    const state: State = {
      extractedTextareas: new Map(),
      hiddenTextareas: new Set(),
      generateId,
      onTextareaExtracted,
      onTextareaDisposed,
      config,
    };

    findAndHandleTextareas(document.body, state);

    const mutationObserver = new MutationObserver((mutations) => {
      handleMutations(mutations, state);
    });
    mutationObserver.observe(document.body, { subtree: true, childList: true });

    let visibilityObserver: MutationObserver | undefined;
    if (config.visibility !== undefined) {
      visibilityObserver = new MutationObserver(() => {
        checkTextareaVisibility(state);
      });
      visibilityObserver.observe(
        config.visibility.target,
        config.visibility.observerInit,
      );
    }

    return () => {
      mutationObserver.disconnect();
      visibilityObserver?.disconnect();
    };
  };
}
