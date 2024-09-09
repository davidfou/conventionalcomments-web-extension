import { v4 as uuidv4 } from "uuid";

import commentEditorExtractors from "./commentEditorExtractors";
import type { ContentRequestMessage } from "../messageTypes";
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
const disposeNoteHolder = (id: string): void => {
  if (!noteHolders.has(id)) {
    return;
  }
  const noteHolder = noteHolders.get(id);
  noteHolder?.button.$destroy();
  noteHolder?.editor.$destroy();
  removeStore(id);
  noteHolders.delete(id);
};

const disposeFunctions = commentEditorExtractors.map((commentEditorExtractor) =>
  commentEditorExtractor(
    uuidv4,
    ({
      id,
      textarea,
      isMainComment,
      buttonParams,
      editorParams,
      productType,
    }) => {
      addStore(id, isMainComment, textarea, productType);
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
    disposeNoteHolder
  )
);

chrome.runtime.onMessage.addListener((message: ContentRequestMessage): void => {
  if (message.type !== "notify-unregister") {
    return;
  }
  noteHolders.forEach((_, key) => {
    disposeNoteHolder(key);
  });
  disposeFunctions.forEach((dispose) => {
    dispose();
  });
});
