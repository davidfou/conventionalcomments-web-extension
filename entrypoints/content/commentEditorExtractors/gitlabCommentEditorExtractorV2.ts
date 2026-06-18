import createExtractor, { type PlatformConfig } from "./createExtractor";

function getIsMainComment(el: Element): boolean {
  if (el.closest("[data-testid='reply-wrapper']") !== null) {
    return false;
  }
  const mainCommentEl =
    el
      .closest(".js-discussion-container")
      ?.querySelector("li[data-testid='noteable-note-container']") ?? null;
  return (
    mainCommentEl === null ||
    mainCommentEl === el.closest("li[data-testid='noteable-note-container']")
  );
}

const config: PlatformConfig = {
  productType: "gitlab-v2",

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
        .querySelectorAll("textarea#note_note")
        .values()
        .filter((el) => el instanceof HTMLTextAreaElement),
    );
  },

  extractElements(textarea) {
    if (textarea.id !== "note_note") {
      return null;
    }
    const mainEl = textarea.closest("form");
    const fileContainer = textarea.closest("diff-file");
    if (mainEl === null || fileContainer === null) {
      return null;
    }
    const anchorEl = mainEl.querySelector(".div-dropzone");
    if (anchorEl === null) {
      return null;
    }

    return { mainEl, anchorEl };
  },

  isMainComment(_textarea, mainEl) {
    return getIsMainComment(mainEl);
  },
};

export default createExtractor(config);
