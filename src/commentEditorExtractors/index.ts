import type { CommentEditorExtractor } from "./CommentEditorExtractor";
import type { ProductType } from "../types";
import gitlab from "./gitlabCommentEditorExtractor";
import github from "./githubCommentEditorExtractor";

const commentEditorExtractors: Record<ProductType, CommentEditorExtractor> = {
  gitlab,
  github,
};

export default commentEditorExtractors;
