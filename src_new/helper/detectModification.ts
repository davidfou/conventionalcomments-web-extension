function detectModification(
  prependedComment: string,
  comment: string,
): string | null {
  if (comment.startsWith(prependedComment)) {
    return null;
  }

  const index = comment
    .split("")
    .findIndex(
      (currentChar, currentIndex) =>
        prependedComment[currentIndex] !== currentChar,
    );

  if (index === -1) {
    return prependedComment;
  }

  return prependedComment + comment.substring(index);
}

export default detectModification;
