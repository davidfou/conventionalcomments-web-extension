// @vitest-environment jsdom
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing";
import { DEFAULT_LABEL } from "~/entrypoints/content/constants";
import { getDefaultLabel, setDefaultLabel } from "~/lib/defaultLabel";
import useDefaultLabel from "./useDefaultLabel";

vi.mock("~/lib/defaultLabel", { spy: true });

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

async function render(): Promise<void> {
  root = createRoot(document.createElement("div"));
  act(() => root.render(<Harness />));
  await act(flushPromises);
}

beforeEach(() => {
  fakeBrowser.reset();
});

afterEach(() => {
  act(() => root.unmount());
  vi.mocked(getDefaultLabel).mockRestore();
  vi.mocked(setDefaultLabel).mockRestore();
});

it("starts loading with DEFAULT_LABEL", () => {
  root = createRoot(document.createElement("div"));
  act(() => root.render(<Harness />));

  expect(result[0]).toEqual({
    label: DEFAULT_LABEL,
    status: "loading",
    error: null,
  });
});

it("loads the stored label", async () => {
  await setDefaultLabel("question");

  await render();

  expect(result[0]).toEqual({
    label: "question",
    status: "loaded",
    error: null,
  });
});

it("falls back to DEFAULT_LABEL with an error when loading fails", async () => {
  vi.mocked(getDefaultLabel).mockRejectedValueOnce(new Error("load failed"));

  await render();

  expect(result[0]).toEqual({
    label: DEFAULT_LABEL,
    status: "loaded",
    error: expect.stringContaining("retrieving the default label"),
  });
});

it("saves the new label", async () => {
  await render();

  await act(() => result[1]("question"));

  expect(result[0]).toEqual({
    label: "question",
    status: "loaded",
    error: null,
  });
  expect(await getDefaultLabel()).toBe("question");
});

it("restores the previous label with an error when saving fails", async () => {
  await setDefaultLabel("issue");
  await render();
  vi.mocked(setDefaultLabel).mockRejectedValueOnce(new Error("save failed"));

  await act(() => result[1]("question"));

  expect(result[0]).toEqual({
    label: "issue",
    status: "loaded",
    error: expect.stringContaining("saving the default label"),
  });
});
