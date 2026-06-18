// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import invariant from "tiny-invariant";
import createExtractor, { type PlatformConfig } from "./createExtractor";
import type { OnTextareaExtracted } from "./CommentEditorExtractor";

function getParent(textarea: HTMLTextAreaElement): HTMLElement {
  const parent = textarea.parentElement;
  invariant(parent !== null, "textarea must have a parent");
  return parent;
}

// jsdom doesn't implement checkVisibility — provide a default
const defaultCheckVisibility = (): boolean => true;
HTMLElement.prototype.checkVisibility = defaultCheckVisibility;

function createMockConfig(
  overrides: Partial<PlatformConfig> = {},
): PlatformConfig {
  return {
    productType: "github-v1",
    findTextareasInNode: (node) => {
      if (node instanceof Element) {
        return Array.from(node.querySelectorAll("textarea"));
      }
      return [];
    },
    extractElements: (textarea) => {
      const parent = textarea.parentElement;
      if (parent === null) {
        return null;
      }
      return { mainEl: parent, anchorEl: parent };
    },
    isMainComment: () => true,
    ...overrides,
  };
}

function addTextareaToDOM(): HTMLTextAreaElement {
  const container = document.createElement("div");
  const textarea = document.createElement("textarea");
  container.append(textarea);
  document.body.append(container);
  return textarea;
}

describe("createExtractor", () => {
  let idCounter: number;
  let generateId: () => string;
  let onTextareaExtracted: ReturnType<typeof vi.fn<OnTextareaExtracted>>;
  let onTextareaDisposed: ReturnType<typeof vi.fn<(id: string) => void>>;
  let cleanupExtractor: (() => void) | null;

  beforeEach(() => {
    idCounter = 0;
    generateId = () => {
      idCounter += 1;
      return `id-${idCounter}`;
    };
    onTextareaExtracted = vi.fn<OnTextareaExtracted>();
    onTextareaDisposed = vi.fn<(id: string) => void>();
    cleanupExtractor = null;
  });

  afterEach(() => {
    // Disconnect observers BEFORE clearing DOM to prevent stale callbacks
    cleanupExtractor?.();
    document.body.innerHTML = "";
    HTMLElement.prototype.checkVisibility = defaultCheckVisibility;
    vi.restoreAllMocks();
  });

  function setupExtractor(config: PlatformConfig): () => void {
    const cleanup = createExtractor(config)(
      generateId,
      onTextareaExtracted,
      onTextareaDisposed,
    );
    cleanupExtractor = cleanup;
    return cleanup;
  }

  describe("initial scan", () => {
    it("scans document.body on init", () => {
      const textarea = addTextareaToDOM();
      const config = createMockConfig();
      setupExtractor(config);

      expect(onTextareaExtracted).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "id-1",
          textarea,
          isMainComment: true,
          productType: "github-v1",
        }),
      );
    });
  });

  describe("textarea lifecycle via mutations", () => {
    it("extracts a textarea added to the DOM", async () => {
      const config = createMockConfig();
      setupExtractor(config);

      addTextareaToDOM();

      await vi.waitFor(() => {
        expect(onTextareaExtracted).toHaveBeenCalledTimes(1);
      });
    });

    it("disposes a textarea when removed from the DOM", async () => {
      const config = createMockConfig();
      const textarea = addTextareaToDOM();
      setupExtractor(config);

      expect(onTextareaExtracted).toHaveBeenCalledTimes(1);

      getParent(textarea).remove();

      await vi.waitFor(() => {
        expect(onTextareaDisposed).toHaveBeenCalledWith("id-1");
      });
    });

    it("does not extract the same textarea twice", async () => {
      const config = createMockConfig();
      const textarea = addTextareaToDOM();
      setupExtractor(config);

      expect(onTextareaExtracted).toHaveBeenCalledTimes(1);

      // Trigger another mutation on the same parent
      getParent(textarea).append(document.createElement("span"));

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      expect(onTextareaExtracted).toHaveBeenCalledTimes(1);
    });

    it("skips textareas where extractElements returns null", async () => {
      const config = createMockConfig({ extractElements: () => null });
      setupExtractor(config);

      addTextareaToDOM();

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      expect(onTextareaExtracted).not.toHaveBeenCalled();
    });
  });

  describe("visibility tracking", () => {
    it("tracks hidden textareas and does not extract them", () => {
      HTMLElement.prototype.checkVisibility = () => false;

      const config = createMockConfig();
      addTextareaToDOM();
      setupExtractor(config);

      expect(onTextareaExtracted).not.toHaveBeenCalled();
    });

    it("disposes extracted textarea that becomes hidden via scoped observer", async () => {
      const config = createMockConfig({
        visibility: {
          target: document.body,
          observerInit: {
            subtree: true,
            attributes: true,
            attributeFilter: ["hidden"],
          },
        },
      });
      const textarea = addTextareaToDOM();
      setupExtractor(config);

      expect(onTextareaExtracted).toHaveBeenCalledTimes(1);

      // Simulate the textarea's container being hidden
      HTMLElement.prototype.checkVisibility = () => false;
      getParent(textarea).setAttribute("hidden", "");

      await vi.waitFor(() => {
        expect(onTextareaDisposed).toHaveBeenCalledWith("id-1");
      });
    });

    it("re-extracts hidden textarea when it becomes visible via scoped observer", async () => {
      HTMLElement.prototype.checkVisibility = () => false;

      const config = createMockConfig({
        visibility: {
          target: document.body,
          observerInit: {
            subtree: true,
            attributes: true,
            attributeFilter: ["hidden"],
          },
        },
      });
      const textarea = addTextareaToDOM();
      // Set the hidden attribute so that removing it triggers the observer
      getParent(textarea).setAttribute("hidden", "");
      setupExtractor(config);

      expect(onTextareaExtracted).not.toHaveBeenCalled();

      // Make visible and trigger attribute change that the observer detects
      HTMLElement.prototype.checkVisibility = () => true;
      getParent(textarea).removeAttribute("hidden");

      await vi.waitFor(() => {
        expect(onTextareaExtracted).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("hidden textarea removal (bug fix)", () => {
    it("cleans up hidden textareas when their parent is removed", async () => {
      HTMLElement.prototype.checkVisibility = () => false;

      const config = createMockConfig();
      const textarea = addTextareaToDOM();
      setupExtractor(config);

      // Textarea is hidden — not extracted
      expect(onTextareaExtracted).not.toHaveBeenCalled();

      // Remove the hidden textarea's parent
      getParent(textarea).remove();

      // Wait for MutationObserver to process the removal
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      // Now make a new visible textarea
      HTMLElement.prototype.checkVisibility = () => true;
      addTextareaToDOM();

      await vi.waitFor(() => {
        expect(onTextareaExtracted).toHaveBeenCalledTimes(1);
      });

      // onTextareaDisposed should NOT have been called
      // (the textarea was never extracted, only hidden)
      expect(onTextareaDisposed).not.toHaveBeenCalled();
    });
  });

  describe("container cleanup", () => {
    it("removes existing ccext-container elements before extraction", () => {
      const config = createMockConfig();
      const textarea = addTextareaToDOM();
      const existing = document.createElement("div");
      existing.dataset.testid = "ccext-container";
      getParent(textarea).append(existing);

      setupExtractor(config);

      expect(
        getParent(textarea).querySelector('[data-testid="ccext-container"]'),
      ).toBeNull();
    });
  });

  describe("cleanup function", () => {
    it("disconnects all observers on cleanup", async () => {
      const config = createMockConfig({
        visibility: {
          target: document.body,
          observerInit: {
            subtree: true,
            attributes: true,
            attributeFilter: ["hidden"],
          },
        },
      });
      addTextareaToDOM();
      const cleanup = setupExtractor(config);

      cleanup();
      cleanupExtractor = null;

      // After cleanup, new textareas should not be detected
      addTextareaToDOM();

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      expect(onTextareaExtracted).toHaveBeenCalledTimes(1);
    });
  });

  describe("isMainComment", () => {
    it("passes isMainComment result through to callback", () => {
      const config = createMockConfig({
        isMainComment: () => false,
      });
      addTextareaToDOM();
      setupExtractor(config);

      expect(onTextareaExtracted).toHaveBeenCalledWith(
        expect.objectContaining({ isMainComment: false }),
      );
    });
  });
});
