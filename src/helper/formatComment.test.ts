import formatComment from "./formatComment";
import extractComment from "./extractComment";

it("returns expected output with only a label", () => {
  expect(formatComment("praise", [])).toEqual("**praise:** ");
});

it("returns expected output with one decoration", () => {
  expect(formatComment("praise", ["non-blocking"])).toEqual(
    "**praise (non-blocking):** "
  );
});

it("returns expected output with two decorations", () => {
  expect(formatComment("praise", ["non-blocking", "if-minor"])).toEqual(
    "**praise (non-blocking, if-minor):** "
  );
});

it.each`
  label       | decorations
  ${"praise"} | ${[]}
  ${"praise"} | ${["non-blocking"]}
  ${"praise"} | ${["non-blocking", "if-minor"]}
`(
  "is compatible with extractComment helper with label $label and decorations $decorations",
  ({ label, decorations }) => {
    const comment = formatComment(label, decorations);

    expect(extractComment(comment, [label], decorations)).toEqual(
      expect.objectContaining({
        label,
        decorations,
      })
    );
  }
);
