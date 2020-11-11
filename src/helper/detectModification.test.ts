import detectModification from "./detectModification";

const PREPENDED_COMMENT = "praise (non-blocking): ";
const COMMENT = `my comment`;

it.each`
  comment                                | fixedComment
  ${"praise (non-blocking): "}           | ${null}
  ${"praise (non-blocking):"}            | ${PREPENDED_COMMENT}
  ${"praise (non-blocki"}                | ${PREPENDED_COMMENT}
  ${"praise (non-blocking): my comment"} | ${null}
  ${"praise (non-blocking):my comment"}  | ${PREPENDED_COMMENT + COMMENT}
  ${"praise (non-blockingmy comment"}    | ${PREPENDED_COMMENT + COMMENT}
`(
  "returns `$fixedComment` when comment is `$comment`",
  ({ comment, fixedComment }) => {
    expect(detectModification(PREPENDED_COMMENT, comment)).toBe(fixedComment);
  }
);
