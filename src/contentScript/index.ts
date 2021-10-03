import { v4 as uuidv4 } from "uuid";

import commentEditorExtractors from "../commentEditorExtractors";
import type { ProductType } from "../types";
import { addStore, removeStore } from "./store";
import Button from "./Button.svelte";
import Editor from "./Editor.svelte";

const noteHolders: Map<
  string,
  {
    button: Button;
    editor: Editor;
  }
> = new Map();

const detectProduct = (): ProductType => {
  switch (window.location.hostname) {
    case "gitlab.com": {
      return "gitlab";
    }
    case "github.com": {
      return "github";
    }
    default:
      throw new Error("Product not detected");
  }
};

const product = detectProduct();
const commentEditorExtractor = commentEditorExtractors[product];

commentEditorExtractor(
  uuidv4,
  ({ id, textarea, isMainComment, buttonParams, editorParams }) => {
    addStore(id, isMainComment, textarea);
    const button = new Button({
      ...buttonParams,
      props: { textarea, id, product },
    });

    const editor = new Editor({
      ...editorParams,
      props: { textarea, id, product },
    });

    noteHolders.set(id, { button, editor });
  },
  (id) => {
    if (!noteHolders.has(id)) {
      return;
    }
    const noteHolder = noteHolders.get(id);
    noteHolder?.button.$destroy();
    noteHolder?.editor.$destroy();
    removeStore(id);
    noteHolders.delete(id);
  }
);
