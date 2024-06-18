import escapeRegExp from "escape-string-regexp";

function extractComment(
  comment: string,
  allowedLabels: string[],
  allowedDecorations: string[],
): { label: string; decorations: string[]; totalLength: number } | null {
  const labelRegExp = allowedLabels
    .map((label) => escapeRegExp(label))
    .join("|");
  const decorationsRegExp = allowedDecorations
    .map((decoration) => escapeRegExp(decoration))
    .join("|");

  const regExp = new RegExp(
    `^(?<full>\\*\\*(?<label>${labelRegExp})( \\((?<decorationsAsString>(${decorationsRegExp})(, (${decorationsRegExp}))*)\\))?:\\*\\* )`,
  );
  const match = regExp.exec(comment);

  if (match === null || match.groups === undefined) {
    return null;
  }

  const { label, decorationsAsString, full } = match.groups;
  const decorations = decorationsAsString?.split(", ") ?? [];

  if (
    decorations.some(
      (decoration, index) => decorations.indexOf(decoration) !== index,
    )
  ) {
    return null;
  }

  return { label, decorations, totalLength: full.length };
}

export default extractComment;
