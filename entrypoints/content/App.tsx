import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import Editor from "./Editor";
import { ProductType, SelectableItem } from "./types";
import extractComment from "./extractComment";
import { DECORATIONS, EMPTY_LABEL, LABELS } from "./constants";
import { getConventions } from "./getConventions";
import useTextareaWrapper from "./useTextareaWrapper";

interface AppProps {
  productType: ProductType;
  textarea: HTMLTextAreaElement;
  isMainComment: boolean;
}

function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
  // Avoids keyboard shortcuts from being triggered when typing in an input
  if (e.target instanceof HTMLInputElement) {
    e.stopPropagation();
  }
}

function App({ productType, textarea, isMainComment }: AppProps): ReactElement {
  const [conventions, setConventions] = useState<{
    labels: readonly SelectableItem[];
    decorations: readonly SelectableItem[];
  }>({
    labels: LABELS,
    decorations: DECORATIONS,
  });

  const [{ label, decorations }, setState] = useState<{
    label: string;
    decorations: string[];
  }>({
    label: EMPTY_LABEL,
    decorations: [],
  });

  // Load custom conventions if available
  useEffect(() => {
    getConventions(productType)
      .then((customConventions) => {
        setConventions(customConventions);

        // Re-extract comment with the loaded conventions
        const initialComment = extractComment(
          textarea.value,
          customConventions.labels.map(({ label }) => label),
          customConventions.decorations.map(({ label }) => label),
        );

        if (initialComment !== null) {
          setState({
            label: initialComment.label,
            decorations: initialComment.decorations,
          });
        } else if (isMainComment && textarea.value === "") {
          // Set default label for main comment only if textarea is empty
          // Use index 1 which should be "praise" in defaults or first custom label
          setState({
            label: customConventions.labels[1]?.label ?? EMPTY_LABEL,
            decorations: [],
          });
        }

        return customConventions;
      })
      .catch(() => {
        // Keep using default conventions on error
      });
  }, [productType, textarea, isMainComment]);

  useTextareaWrapper(textarea, label, decorations);

  const onSelectLabel = useCallback((label: string): void => {
    setState((prev) => ({
      ...prev,
      label,
    }));
  }, []);

  const onToggleDecoration = useCallback((decoration: string): void => {
    setState((prev) => ({
      ...prev,
      decorations: prev.decorations.includes(decoration)
        ? prev.decorations.filter((d) => d !== decoration)
        : [...prev.decorations, decoration],
    }));
  }, []);

  const onAction = useCallback(() => textarea.focus(), [textarea]);

  return (
    <div onKeyDown={onKeyDown}>
      <Editor
        productType={productType}
        label={label}
        decorations={decorations}
        labels={conventions.labels}
        conventionDecorations={conventions.decorations}
        onSelectLabel={onSelectLabel}
        onToggleDecoration={onToggleDecoration}
        onAction={onAction}
      />
    </div>
  );
}

export default App;
