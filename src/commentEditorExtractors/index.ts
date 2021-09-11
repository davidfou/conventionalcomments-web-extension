import type { CommentEditorExtractor } from "./CommentEditorExtractor";
import gitlab from "./gitlabCommentEditorExtractor";

const commentEditorExtractors: Record<"gitlab", CommentEditorExtractor> = {
  gitlab,
};

export default commentEditorExtractors;
