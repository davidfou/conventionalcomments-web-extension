import type { CommentEditorExtractor } from "./CommentEditorExtractor";
import gitlabV1 from "./gitlabCommentEditorExtractorV1";
import github from "./githubCommentEditorExtractor";

const commentEditorExtractors: CommentEditorExtractor[] = [gitlabV1, github];

export default commentEditorExtractors;
