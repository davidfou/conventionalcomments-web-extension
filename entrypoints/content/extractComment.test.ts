import { it, expect } from "vitest";
import extractComment from "./extractComment";

const allowedLabels = ["label1", "label2", "label3"];
const allowedDecorations = ["decoration 1", "decoration 2", "decoration 3"];

it("extracts a comment with only a label", () => {
  const comment = "**label1:** my comment";

  expect(extractComment(comment, allowedLabels, allowedDecorations)).toEqual({
    label: "label1",
    decorations: [],
    totalLength: 12,
  });
});

it("extracts a comment with one decoration", () => {
  const comment = "**label1 (decoration 1):** my comment";

  expect(extractComment(comment, allowedLabels, allowedDecorations)).toEqual({
    label: "label1",
    decorations: ["decoration 1"],
    totalLength: 27,
  });
});

it("extracts a comment with two decorations", () => {
  const comment = "**label1 (decoration 1, decoration 2):** my comment";

  expect(extractComment(comment, allowedLabels, allowedDecorations)).toEqual({
    label: "label1",
    decorations: ["decoration 1", "decoration 2"],
    totalLength: 41,
  });
});

it("extracts a comment with three decorations", () => {
  const comment =
    "**label1 (decoration 1, decoration 2, decoration 3):** my comment";

  expect(extractComment(comment, allowedLabels, allowedDecorations)).toEqual({
    label: "label1",
    decorations: ["decoration 1", "decoration 2", "decoration 3"],
    totalLength: 55,
  });
});

it("extracts a comment with three decorations and respects order", () => {
  const comment =
    "**label1 (decoration 3, decoration 2, decoration 1):** my comment";

  expect(extractComment(comment, allowedLabels, allowedDecorations)).toEqual({
    label: "label1",
    decorations: ["decoration 3", "decoration 2", "decoration 1"],
    totalLength: 55,
  });
});

it("ignores when the label isn't allowed", () => {
  const comment = "**label4:** my comment";

  expect(extractComment(comment, allowedLabels, allowedDecorations)).toBeNull();
});

it("ignores when the decoration isn't allowed", () => {
  const comment = "**label1 (decoration4):** my comment";

  expect(extractComment(comment, allowedLabels, allowedDecorations)).toBeNull();
});

it("works with label containing special character", () => {
  const comment = "**label?:** my comment";

  expect(extractComment(comment, ["label?"], allowedDecorations)).toEqual({
    label: "label?",
    decorations: [],
    totalLength: 12,
  });
});

it("works with decoration containing special character", () => {
  const comment = "**label1 (decoration?):** my comment";

  expect(extractComment(comment, allowedLabels, ["decoration?"])).toEqual({
    label: "label1",
    decorations: ["decoration?"],
    totalLength: 26,
  });
});

it("ignores when not on the start", () => {
  const comment = "Start **label1:** my comment";

  expect(extractComment(comment, allowedLabels, allowedDecorations)).toBeNull();
});

it("ignores when not on the first line", () => {
  const comment = ["My first line", "**label1:** my second line"].join("\n");

  expect(extractComment(comment, allowedLabels, allowedDecorations)).toBeNull();
});

it("ignores when the same decoration is mention more twice", () => {
  const comment =
    "**label1 (decoration 1, decoration 2, decoration 1):** my comment";

  expect(extractComment(comment, allowedLabels, allowedDecorations)).toBeNull();
});

it.each([
  "*label1:** my comment",
  "**label1:* my comment",
  "**label1:**my comment",
  "**label1(decoration 1):** my comment",
  "**label1  (decoration 1):** my comment",
  "**label1 (decoration 1) :** my comment",
  "**label1 (,decoration 1):** my comment",
  "**label1 (decoration 1,):** my comment",
  "**label1 (decoration 1,decoration 2):** my comment",
  "**label1 (decoration 1,  decoration 2):** my comment",
  "**label1 (decoration 1 , decoration 2):** my comment",
])("ignores comment `%s`", (comment) => {
  expect(extractComment(comment, allowedLabels, allowedDecorations)).toBeNull();
});
