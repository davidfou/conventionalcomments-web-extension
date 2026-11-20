import createExtractor, { type PlatformConfig } from "./createExtractor";

// Azure DevOps renders a hidden clone of each textarea to measure its height
const HIDDEN_CLONE_CLASS = "bolt-textfield-auto-adjust-hidden";

// New threads carry a negative thread id class (e.g. `threadId--1`), replies
// to existing threads don't
const NEW_THREAD_CLASS_REGEX = /^threadId--\d+$/;

const config: PlatformConfig = {
  productType: "azure-devops-v1",

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
        .querySelectorAll(
          `textarea.bolt-textfield-input:not(.${HIDDEN_CLONE_CLASS})`,
        )
        .values()
        .filter((el) => el instanceof HTMLTextAreaElement),
    );
  },

  extractElements(textarea) {
    if (textarea.classList.contains(HIDDEN_CLONE_CLASS)) {
      return null;
    }
    const mainEl = textarea.closest(".repos-comment-editor-fit");
    const anchorEl = textarea.closest(".bolt-textfield");
    if (mainEl === null || anchorEl === null) {
      return null;
    }

    return { mainEl, anchorEl };
  },

  isMainComment(textarea) {
    return Array.from(textarea.classList).some((className) =>
      NEW_THREAD_CLASS_REGEX.test(className),
    );
  },
};

export default createExtractor(config);
