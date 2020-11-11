import { v4 as uuidv4 } from "uuid";

import { addStore, removeStore } from "./store";
import Button from "./Button.svelte";
import Editor from "./Editor.svelte";

const noteHolders: Map<
  HTMLElement,
  { id: string; button: Button; editor: Editor }
> = new Map();

const forceQuerySelector = (el: Element, selector: string): Element => {
  const foundEl = el.querySelector(selector);
  if (foundEl === null) {
    throw new Error(`No element found with selector '${selector}'`);
  }
  return foundEl;
};

const getIsMainComment = (el: Element): boolean => {
  const mainCommentEl = el
    .closest(".discussion-notes")
    ?.querySelector("li[data-qa-selector=noteable_note_container]");
  return (
    mainCommentEl === null ||
    mainCommentEl === el.closest("li[data-qa-selector=noteable_note_container]")
  );
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type !== "childList") {
      return;
    }

    Array.from(mutation.addedNodes)
      .filter(
        (node): node is HTMLTextAreaElement =>
          node instanceof HTMLElement &&
          node.tagName === "TEXTAREA" &&
          node.id === "note_note"
      )
      .forEach((textarea) => {
        const mainEl = textarea.closest("form");
        if (mainEl === null) {
          throw new Error("No element form found");
        }
        const id = uuidv4();
        addStore(id, getIsMainComment(mainEl), textarea);

        const navList = forceQuerySelector(
          mainEl,
          ".nav-links > .md-header-toolbar"
        );
        const navItem = document.createElement("div");
        navItem.classList.add("d-inline-block", "ml-md-2", "ml-0");

        const button = new Button({
          target: navItem,
          props: { textarea, id },
        });

        const editor = new Editor({
          target: forceQuerySelector(mainEl, ".div-dropzone-wrapper"),
          anchor: forceQuerySelector(mainEl, ".div-dropzone"),
          props: { textarea, id },
        });

        const lastItem = navList.childNodes[navList.childNodes.length - 1];
        navList.insertBefore(navItem, lastItem);
        navList.insertBefore(document.createTextNode(" "), lastItem);

        noteHolders.set(mainEl, { id, button, editor });
      });

    Array.from(mutation.removedNodes)
      .filter((node): node is HTMLElement => node instanceof HTMLElement)
      .forEach((noteHolderEl) => {
        const noteHolder = noteHolders.get(noteHolderEl);
        if (noteHolder === undefined) {
          return;
        }

        noteHolder.button.$destroy();
        noteHolder.editor.$destroy();
        removeStore(noteHolder.id);
        noteHolders.delete(noteHolderEl);
      });
  });
});

observer.observe(document.body, { subtree: true, childList: true });
