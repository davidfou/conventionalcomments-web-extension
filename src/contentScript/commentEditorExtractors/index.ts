import type { CommentEditorExtractor } from "./CommentEditorExtractor";
import gitlabV1 from "./gitlabCommentEditorExtractorV1";
import gitlabV2 from "./gitlabCommentEditorExtractorV2";
import githubV1 from "./githubCommentEditorExtractorV1";
import githubV2 from "./githubCommentEditorExtractorV2";

const commentEditorExtractors: CommentEditorExtractor[] = [
  gitlabV1,
  gitlabV2,
  githubV1,
  githubV2,
];

export default commentEditorExtractors;
