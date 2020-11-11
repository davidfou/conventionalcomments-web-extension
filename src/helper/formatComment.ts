const formatDecorations = (decorations: string[]): string => {
  if (decorations.length === 0) {
    return "";
  }

  return ` (${decorations.join(", ")})`;
};

const formatComment = (label: string, decorations: string[]): string =>
  `**${label}${formatDecorations(decorations)}:** `;

export default formatComment;
