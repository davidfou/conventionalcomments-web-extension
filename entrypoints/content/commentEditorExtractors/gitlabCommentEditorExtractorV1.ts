import createExtractor, { type PlatformConfig } from "./createExtractor";

function getIsMainComment(el: Element): boolean {
  const mainCommentEl =
    el
      .closest(".discussion-notes")
      ?.querySelector("li[data-testid='noteable-note-container']") ?? null;
  return (
    mainCommentEl === null ||
    mainCommentEl === el.closest("li[data-testid='noteable-note-container']")
  );
}

const config: PlatformConfig = {
  productType: "gitlab-v1",

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
    const fileContainer = textarea.closest(".file-holder");
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
