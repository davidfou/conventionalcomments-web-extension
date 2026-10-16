import createExtractor, { type PlatformConfig } from "./createExtractor";

const NEW_FILE_THREAD_SELECTOR_CLASS = "diffAddFileThread";

// GitHub removed the CSS module names from these generated class names (for
// example, `InlineMarkers-module__markersWrapper` became `markersWrapper`).
// Keep matching the previous names as well while GitHub rolls out the change.
const MAIN_CSS_SELECTORS = [
  "[class*='InlineMarkers-module__markersWrapper']",
  "[class*='InlineMarkers-module__fileMarkersWrapper']",
  "[class*='markersWrapper__']",
  "[class*='fileMarkersWrapper__']",
  `[class*=${JSON.stringify(NEW_FILE_THREAD_SELECTOR_CLASS)}]`,
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
        .some((className) => className.includes(NEW_FILE_THREAD_SELECTOR_CLASS))
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
      "[class*='MarkdownInput-module__inputWrapper'], [class*='inputWrapper__']",
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
          className.includes(NEW_FILE_THREAD_SELECTOR_CLASS),
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
