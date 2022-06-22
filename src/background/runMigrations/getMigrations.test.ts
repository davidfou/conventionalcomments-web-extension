import { readdir } from "fs/promises";
import path from "path";

import getMigrations from "./getMigrations";

jest.mock("webextension-polyfill");

let fileNames: string[];

beforeEach(async () => {
  fileNames = await readdir(path.join(__dirname, "./migrations"));
});

it("has files formatted as YYYY-MM-DD_<migration description>.ts", () => {
  fileNames.forEach((fileName) => {
    expect(fileName).toMatch(/^\d{4}-\d{2}-\d{2}_[a-zA-Z]+\.ts$/);
  });
});

it("exports the migrations in the correct order and with the expected keys", () => {
  const sortedFileNames = [...fileNames].sort();
  expect(getMigrations()).toEqual(
    sortedFileNames.map((fileName) => ({
      key: path.basename(fileName, ".ts").split("_")[1],
      run: expect.any(Function),
    }))
  );
});
