import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sizeOf from "image-size";

import manifest from "../../../public/manifest.json";
import getIcons from "./getIcons";

const DEFAULT_ICONS = manifest.action.default_icon;
const EXPECTED_SIZES = Object.keys(DEFAULT_ICONS);

describe.each`
  flavor       | hasAnnouncement
  ${"default"} | ${false}
  ${"active"}  | ${false}
  ${"warning"} | ${false}
  ${"default"} | ${true}
  ${"active"}  | ${true}
  ${"warning"} | ${true}
`(
  "with flavor $flavor and hasAnnouncement $hasAnnouncement",
  ({ flavor, hasAnnouncement }) => {
    it("returns expected keys", () => {
      expect(getIcons(flavor, hasAnnouncement)).toEqual(
        Object.fromEntries(
          EXPECTED_SIZES.map((size) => [size, expect.any(String)])
        )
      );
    });

    it.each(EXPECTED_SIZES)(
      "returns an existing file for the size %s",
      async (size) => {
        const filename = getIcons(flavor, hasAnnouncement)[size];
        await expect(
          fs.access(path.join(__dirname, "../../../public", filename))
        ).resolves.toEqual(undefined);
      }
    );
  }
);

it("returns default icons when flavor is normal and hasAnnouncement false", () => {
  expect(getIcons("default", false)).toEqual(DEFAULT_ICONS);
});

it.each<[string, string]>([
  ...Object.entries(manifest.icons),
  ...Object.entries(manifest.action.default_icon),
])("has size %s for image %s", async (key, filename) => {
  const expectedSize = parseInt(key, 10);
  const size = await promisify(sizeOf)(
    path.join(__dirname, "../../../public", filename)
  );
  expect(size).toEqual(
    expect.objectContaining({ width: expectedSize, height: expectedSize })
  );
});
