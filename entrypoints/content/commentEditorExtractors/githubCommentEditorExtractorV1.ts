import createExtractor, { type PlatformConfig } from "./createExtractor";

function isValidTextarea(textarea: HTMLTextAreaElement): boolean {
  const form = textarea.closest("form");
  if (
    form === null ||
    (!form.classList.contains("js-comment-update") &&
      !form.classList.contains("js-inline-comment-form")) ||
    form.id !== ""
  ) {
    return false;
  }

  if (
    textarea.closest("#js-inline-comments-single-container-template") !== null
  ) {
    return false;
  }

  return true;
}

const config: PlatformConfig = {
  productType: "github-v1",

  findTextareasInNode(node) {
    if (!(node instanceof Element)) {
      return [];
    }
    const root =
      node instanceof HTMLTextAreaElement ? node.parentElement : node;
    if (root === null) {
      return [];
    }
    return Array.from(
      root
        .querySelectorAll(".js-previewable-comment-form textarea")
        .values()
        .filter((el) => el instanceof HTMLTextAreaElement),
    );
  },

  extractElements(textarea) {
    if (!isValidTextarea(textarea)) {
      return null;
    }

    const mainEl = textarea.closest(".js-previewable-comment-form");
    if (mainEl === null) {
      return null;
    }
    const anchorEl = mainEl.querySelector("file-attachment");
    if (anchorEl === null) {
      return null;
    }

    return { mainEl, anchorEl };
  },

  isMainComment(textarea) {
    return textarea.closest(".review-thread-reply") === null;
  },

  visibility: {
    target: document.body,
    observerInit: {
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden"],
    },
  },
};

export default createExtractor(config);
