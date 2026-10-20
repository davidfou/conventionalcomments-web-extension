import { beforeEach, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing";
import { getDefaultLabel, setDefaultLabel } from "./defaultLabel";

beforeEach(() => {
  fakeBrowser.reset();
});

it("returns the stored label", async () => {
  await setDefaultLabel("question");
  expect(await getDefaultLabel()).toBe("question");
});

it("throws when no label is stored", async () => {
  await expect(getDefaultLabel()).rejects.toThrow(
    "defaultLabel should never be null",
  );
});
