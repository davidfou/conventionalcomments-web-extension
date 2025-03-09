import type { ProductType } from "../types";

export type OnTextareaExtracted = (extractedTextarea: {
  id: string;
  isMainComment: boolean;
  textarea: HTMLTextAreaElement;
  anchor: Element;
  productType: ProductType;
}) => void;

export type CommentEditorExtractor = (
  generateId: () => string,
  onTextareaExtracted: OnTextareaExtracted,
  onTextareaDisposed: (id: string) => void,
) => () => void;
