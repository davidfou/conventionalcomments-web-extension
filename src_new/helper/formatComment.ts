function formatDecorations(decorations: string[]): string {
  if (decorations.length === 0) {
    return "";
  }

  return ` (${decorations.join(", ")})`;
}

function formatComment(label: string, decorations: string[]): string {
  return `**${label}${formatDecorations(decorations)}:** `;
}

export default formatComment;
