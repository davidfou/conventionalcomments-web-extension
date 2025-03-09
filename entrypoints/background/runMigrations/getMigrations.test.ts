import { beforeEach, expect, it } from "vitest";
import { readdir } from "node:fs/promises";
import path from "node:path";

import getMigrations from "./getMigrations";

let fileNames: string[];

beforeEach(async () => {
  fileNames = await readdir(path.join(import.meta.dirname, "./migrations"));
});

it("has files formatted as YYYY-MM-DD_<migration description>.ts", () => {
  for (const fileName of fileNames) {
    expect(fileName).toMatch(/^\d{4}-\d{2}-\d{2}_[a-zA-Z]+\.ts$/);
  }
});

it("exports the migrations in the correct order and with the expected keys", () => {
  const sortedFileNames = fileNames.toSorted();
  expect(getMigrations()).toEqual(
    sortedFileNames.map((fileName) => ({
      key: path.basename(fileName, ".ts").split("_")[1],
      run: expect.any(Function),
    })),
  );
});
