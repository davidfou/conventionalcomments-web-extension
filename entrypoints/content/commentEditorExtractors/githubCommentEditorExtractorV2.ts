import createExtractor, { type PlatformConfig } from "./createExtractor";

const NEW_FILE_THREAD_SELECTOR_CLASS_PREFIX = "Diff-module__diffAddFileThread";

const MAIN_CSS_SELECTORS = [
  "[class*='InlineMarkers-module__markersWrapper']",
  "[class*='InlineMarkers-module__fileMarkersWrapper']",
  `[class*=${JSON.stringify(NEW_FILE_THREAD_SELECTOR_CLASS_PREFIX)}]`,
];

const config: PlatformConfig = {
  productType: "github-v2",

  findTextareasInNode(node) {
    if (!(node instanceof Element)) {
      return [];
    }
    const root =
      node instanceof HTMLTextAreaElement ? node.parentElement : node;
    if (root === null) {
      return [];
    }

    let allTextareas = Array.from(
      root
        .querySelectorAll(
          MAIN_CSS_SELECTORS.map((selector) => `${selector} textarea`).join(
            ", ",
          ),
        )
        .values(),
    );

    // Special case: when the added node itself is a new-file-thread container,
    // also search for all textareas within it (not scoped by main selectors)
    if (
      root.classList
        .values()
        .some((className) =>
          className.startsWith(NEW_FILE_THREAD_SELECTOR_CLASS_PREFIX),
        )
    ) {
      allTextareas = allTextareas.concat(
        Array.from(root.querySelectorAll("textarea").values()),
      );
    }

    return allTextareas.filter((el) => el instanceof HTMLTextAreaElement);
  },

  extractElements(textarea) {
    const mainEl = textarea.closest(MAIN_CSS_SELECTORS.join(", "));
    if (mainEl === null) {
      return null;
    }

    const anchorEl = mainEl.querySelector(
      "[class*='MarkdownInput-module__inputWrapper']",
    );
    if (anchorEl === null) {
      return null;
    }

    return { mainEl, anchorEl };
  },

  isMainComment(textarea, mainEl) {
    return (
      mainEl.classList
        .values()
        .some((className) =>
          className.startsWith(NEW_FILE_THREAD_SELECTOR_CLASS_PREFIX),
        ) ||
      textarea.closest("[data-marker-navigation-new-thread='true']") !== null
    );
  },

  visibility: {
    target: document.body,
    observerInit: {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    },
  },
};

export default createExtractor(config);
