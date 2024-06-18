import type { CommentEditorExtractor } from "./CommentEditorExtractor";
import gitlabV1 from "./gitlabCommentEditorExtractorV1";
import githubV1 from "./githubCommentEditorExtractorV1";

const commentEditorExtractors: CommentEditorExtractor[] = [gitlabV1, githubV1];

export default commentEditorExtractors;
