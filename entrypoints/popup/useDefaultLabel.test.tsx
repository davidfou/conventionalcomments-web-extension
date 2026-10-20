// @vitest-environment jsdom
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing";
import {
  getDefaultLabel,
  setDefaultLabel,
} from "~/entrypoints/background/defaultLabel";
import useDefaultLabel from "./useDefaultLabel";

vi.mock("~/entrypoints/background/defaultLabel", { spy: true });
vi.mock("~/lib/messaging", async () => {
  const background = await import("~/entrypoints/background/defaultLabel");
  return {
    sendMessage: (type: string, label: string) =>
      type === "getDefaultLabel"
        ? background.getDefaultLabel()
        : background.setDefaultLabel(label),
  };
});

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let result: ReturnType<typeof useDefaultLabel>;

function Harness(): ReactElement | null {
  result = useDefaultLabel();
  return null;
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve);
  });
}

function mount(): void {
  root = createRoot(document.createElement("div"));
  act(() => root.render(<Harness />));
}

async function render(): Promise<void> {
  mount();
  await act(flushPromises);
}

beforeEach(async () => {
  fakeBrowser.reset();
  await setDefaultLabel("praise");
});

afterEach(() => {
  act(() => root.unmount());
  vi.restoreAllMocks();
});

it("starts loading", () => {
  mount();

  expect(result[0]).toEqual({ status: "loading" });
});

it("loads the stored label", async () => {
  await render();

  expect(result[0]).toEqual({
    status: "loaded",
    label: "praise",
  });
});

it("shows an error when loading fails", async () => {
  vi.mocked(getDefaultLabel).mockRejectedValueOnce(new Error("load failed"));

  await render();

  expect(result[0]).toEqual({
    status: "error",
    error: expect.stringContaining("retrieving the default label"),
  });
});

it("saves the new label", async () => {
  await render();

  await act(() => result[1]("question"));

  expect(result[0]).toEqual({
    status: "loaded",
    label: "question",
  });
  expect(await getDefaultLabel()).toBe("question");
});

it("restores the previous label with an error when saving fails", async () => {
  await render();
  vi.mocked(setDefaultLabel).mockRejectedValueOnce(new Error("save failed"));

  await act(() => result[1]("question"));

  expect(result[0]).toEqual({
    status: "saveError",
    label: "praise",
    error: expect.stringContaining("saving the default label"),
  });
});

it("recovers from a load error by saving a new label", async () => {
  vi.mocked(getDefaultLabel).mockRejectedValueOnce(new Error("load failed"));
  await render();

  await act(() => result[1]("question"));

  expect(result[0]).toEqual({
    status: "loaded",
    label: "question",
  });
  expect(await getDefaultLabel()).toBe("question");
});

it("keeps the error state when saving after a load error fails", async () => {
  vi.mocked(getDefaultLabel).mockRejectedValueOnce(new Error("load failed"));
  await render();
  vi.mocked(setDefaultLabel).mockRejectedValueOnce(new Error("save failed"));

  await act(() => result[1]("question"));

  expect(result[0]).toEqual({
    status: "error",
    error: expect.stringContaining("saving the default label"),
  });
});
