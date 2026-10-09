import { beforeEach, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing";
import { DEFAULT_LABEL, type Label } from "~/entrypoints/content/constants";
import {
  getDefaultLabel,
  setDefaultLabel,
  watchDefaultLabel,
} from "./defaultLabel";

beforeEach(() => {
  fakeBrowser.reset();
});

it("returns DEFAULT_LABEL when nothing is stored", async () => {
  expect(await getDefaultLabel()).toBe(DEFAULT_LABEL);
});

it("returns the stored label", async () => {
  await setDefaultLabel("question");
  expect(await getDefaultLabel()).toBe("question");
});

it("returns DEFAULT_LABEL when the stored label is unknown", async () => {
  await fakeBrowser.storage.local.set({ defaultLabel: "unknown" });
  expect(await getDefaultLabel()).toBe(DEFAULT_LABEL);
});

it("notifies watchers of a new label", async () => {
  const callback = vi.fn<(label: Label) => void>();
  watchDefaultLabel(callback);

  await setDefaultLabel("question");

  expect(callback).toHaveBeenCalledWith("question");
});

it("notifies watchers with DEFAULT_LABEL when the new label is unknown", async () => {
  const callback = vi.fn<(label: Label) => void>();
  watchDefaultLabel(callback);

  await fakeBrowser.storage.local.set({ defaultLabel: "unknown" });

  expect(callback).toHaveBeenCalledWith(DEFAULT_LABEL);
});

it("stops notifying after unwatching", async () => {
  const callback = vi.fn<(label: Label) => void>();
  const unwatch = watchDefaultLabel(callback);
  unwatch();

  await setDefaultLabel("question");

  expect(callback).not.toHaveBeenCalled();
});
