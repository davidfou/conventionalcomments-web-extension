import type { CommentEditorExtractor } from "./CommentEditorExtractor";
import gitlabV1 from "./gitlabCommentEditorExtractorV1";
import gitlabV2 from "./gitlabCommentEditorExtractorV2";
import github from "./githubCommentEditorExtractor";

const commentEditorExtractors: CommentEditorExtractor[] = [
  gitlabV1,
  gitlabV2,
  github,
];

export default commentEditorExtractors;
