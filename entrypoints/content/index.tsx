import { createRoot, type Root } from "react-dom/client";
import {
  createIntegratedUi,
  type IntegratedContentScriptUi,
  defineContentScript,
} from "#imports";
import { EMPTY_LABEL } from "~/lib/constants";
import getRandomId from "~/lib/getRandomId";
import { onMessage, sendMessage } from "~/lib/messaging";
import commentEditorExtractors from "./commentEditorExtractors";
import App from "./App";
import logger from "./logger";

import "./global.css";

// oxlint-disable-next-line react/only-export-components
export default defineContentScript({
  matches: ["https://github.com/*", "https://gitlab.com/*"],
  registration: "runtime",
  cssInjectionMode: "manual",
  main(ctx) {
    logger("Content script started");
    let defaultLabel = sendMessage("getDefaultLabel").catch((error) => {
      logger("Failed to retrieve the default label: %o", error);
      return EMPTY_LABEL;
    });
    const removeDefaultLabelListener = onMessage(
      "notifyDefaultLabelChange",
      ({ data }) => {
        defaultLabel = Promise.resolve(data);
      },
    );
    ctx.onInvalidated(removeDefaultLabelListener);
    const noteHolders: Map<string, IntegratedContentScriptUi<Root>> = new Map();
    const disposeNoteHolder = (id: string): void => {
      logger("plugin removed (%s)", id);
      const shadowRoot = noteHolders.get(id);
      if (shadowRoot === undefined) {
        return;
      }
      shadowRoot.remove();
    };
    const disposeFunctions = commentEditorExtractors.map(
      (commentEditorExtractor) =>
        commentEditorExtractor(
          getRandomId,
          ({ id, textarea, isMainComment, anchor, productType }) => {
            logger("plugin injected for product `%s` (%s)", productType, id);
            const ui = createIntegratedUi(ctx, {
              position: "inline",
              anchor,
              append: "before",
              onMount(container) {
                container.classList.add(`ccext:${productType}`);
                const rootEl = document.createElement("span");
                rootEl.dataset.testid = "ccext-container";
                container.append(rootEl);
                const root = createRoot(rootEl);
                defaultLabel
                  .then((label) => {
                    root.render(
                      <App
                        productType={productType}
                        textarea={textarea}
                        isMainComment={isMainComment}
                        defaultLabel={label}
                      />,
                    );
                    return;
                  })
                  .catch((error) => {
                    logger("plugin render failed (%s): %o", id, error);
                  });
                return root;
              },
              onRemove: (root) => {
                root?.unmount();
              },
            });
            ui.mount();
            noteHolders.set(id, ui);
          },
          disposeNoteHolder,
        ),
    );

    onMessage("notifyUnregister", () => {
      logger("notifyUnregister received");
      removeDefaultLabelListener();
      for (const key of noteHolders.keys()) {
        disposeNoteHolder(key);
      }
      for (const dispose of disposeFunctions) {
        dispose();
      }
    });
  },
});
