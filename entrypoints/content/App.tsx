import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import Editor from "./Editor";
import { ProductType } from "./types";
import extractComment from "./extractComment";
import { DECORATIONS, EMPTY_LABEL, LABELS } from "./constants";
import { getConventions } from "./getConventions";
import useTextareaWrapper from "./useTextareaWrapper";

interface AppProps {
  productType: ProductType;
  textarea: HTMLTextAreaElement;
  isMainComment: boolean;
}

interface SelectableItem {
  label: string;
  description: string;
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
  }>(() => {
    const initialComment = extractComment(
      textarea.value,
      LABELS.map(({ label }) => label),
      DECORATIONS.map(({ label }) => label),
    );

    if (initialComment !== null) {
      return {
        label: initialComment.label,
        decorations: initialComment.decorations,
      };
    }

    return {
      label:
        isMainComment && textarea.value === "" ? LABELS[1].label : EMPTY_LABEL,
      decorations: [],
    };
  });

  // Load custom conventions if available
  useEffect(() => {
    getConventions(productType)
      .then((customConventions) => {
        setConventions(customConventions);
        return customConventions;
      })
      .catch(() => {
        // Keep using default conventions on error
      });
  }, [productType]);

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
