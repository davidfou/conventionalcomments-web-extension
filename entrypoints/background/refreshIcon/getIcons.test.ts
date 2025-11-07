import { vi, describe, expect, it } from "vitest";
import path from "node:path";
import { imageSizeFromFile } from "image-size/fromFile";

import getIcons from "./getIcons";

vi.mock("wxt/browser", () => ({
  browser: {
    runtime: {
      getURL: (url: string): string => url.slice(1),
    },
  },
}));

const EXPECTED_SIZES = [16, 24, 32, 64];

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
          EXPECTED_SIZES.map((size) => [size, expect.any(String)]),
        ),
      );
    });

    it.each(EXPECTED_SIZES)(
      "returns an image with the size %s",
      async (size) => {
        const filename = getIcons(flavor, hasAnnouncement)[size];
        await expect(
          imageSizeFromFile(
            path.join(import.meta.dirname, "../../../public", filename),
          ),
        ).resolves.toEqual({ width: size, height: size, type: "png" });
      },
    );
  },
);

it.each([16, 32, 48, 96, 128])(
  "has correct size image icon/%s.png",
  async (size) => {
    await expect(
      imageSizeFromFile(
        path.join(import.meta.dirname, "../../../public/icon", `${size}.png`),
      ),
    ).resolves.toEqual({ width: size, height: size, type: "png" });
  },
);
