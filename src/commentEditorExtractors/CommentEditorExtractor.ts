export type CommentEditorExtractor = (
  generateId: () => string,
  onTextareaExtracted: (extractedTextarea: {
    id: string;
    isMainComment: boolean;
    textarea: HTMLTextAreaElement;
    editorParams: { target: Element; anchor?: Element };
    buttonParams: { target: Element; anchor?: Element };
  }) => void,
  onTextareaDisposed: (id: string) => void
) => void;
