import type { ProductType } from "../../types";

export type CommentEditorExtractor = (
  generateId: () => string,
  onTextareaExtracted: (extractedTextarea: {
    id: string;
    isMainComment: boolean;
    textarea: HTMLTextAreaElement;
    editorParams: { target: Element; anchor?: Element };
    buttonParams: { target: Element; anchor?: Element };
    productType: ProductType;
  }) => void,
  onTextareaDisposed: (id: string) => void
) => () => void;
