import type { CommentEditorExtractor } from "./CommentEditorExtractor";
import gitlab from "./gitlabCommentEditorExtractor";
import github from "./githubCommentEditorExtractor";

const commentEditorExtractors: Record<
  "gitlab" | "github",
  CommentEditorExtractor
> = {
  gitlab,
  github,
};

export default commentEditorExtractors;
