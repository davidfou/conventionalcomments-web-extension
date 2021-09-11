import { v4 as uuidv4 } from "uuid";

import commentEditorExtractors from "../commentEditorExtractors";
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

const detectProduct = (): keyof typeof commentEditorExtractors => {
  switch (window.location.hostname) {
    case "gitlab.com": {
      return "gitlab";
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
      props: { textarea, id },
    });

    const editor = new Editor({
      ...editorParams,
      props: { textarea, id },
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
