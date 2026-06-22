import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import Editor from "./Editor";
import { ProductType } from "./types";
import extractComment from "./extractComment";
import { EMPTY_LABEL, EMPTY_LABEL_ENTRY } from "./convention/emptyLabel";
import type { ConventionFile } from "./convention/types";
import useConvention from "./useConvention";
import useTextareaWrapper from "./useTextareaWrapper";

interface AppProps {
  productType: ProductType;
  textarea: HTMLTextAreaElement;
  isMainComment: boolean;
}

interface ResolvedAppProps extends AppProps {
  convention: ConventionFile;
}

function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
  // Avoids keyboard shortcuts from being triggered when typing in an input
  if (e.target instanceof HTMLInputElement) {
    e.stopPropagation();
  }
}

function ResolvedApp({
  productType,
  textarea,
  isMainComment,
  convention,
}: ResolvedAppProps): ReactElement {
  const labelNames = convention.labels.map(({ label }) => label);
  const decorationNames = convention.decorations.map(({ label }) => label);

  const [{ label, decorations }, setState] = useState<{
    label: string;
    decorations: string[];
  }>(() => {
    const initialComment = extractComment(
      textarea.value,
      labelNames,
      decorationNames,
    );

    if (initialComment !== null) {
      return {
        label: initialComment.label,
        decorations: initialComment.decorations,
      };
    }

    return {
      label:
        isMainComment && textarea.value === ""
          ? (convention.defaultLabel ?? EMPTY_LABEL)
          : EMPTY_LABEL,
      decorations: [],
    };
  });

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

  const labelOptions = useMemo(
    () => [EMPTY_LABEL_ENTRY, ...convention.labels],
    [convention.labels],
  );

  return (
    <div onKeyDown={onKeyDown}>
      <Editor
        productType={productType}
        label={label}
        selectedDecorations={decorations}
        labels={labelOptions}
        decorations={convention.decorations}
        emptyLabel={EMPTY_LABEL}
        onSelectLabel={onSelectLabel}
        onToggleDecoration={onToggleDecoration}
        onAction={onAction}
      />
    </div>
  );
}

function App({ productType, textarea, isMainComment }: AppProps): ReactElement {
  const convention = useConvention(window.location.href);
  if (convention === null) {
    // Reserve a sliver of vertical space so the wrapper has non-zero
    // dimensions while the convention fetch resolves. Without this, the
    // ccext-container span is empty (zero height) which Playwright treats
    // as not-visible — breaking navigation specs that probe visibility
    // mid-render.
    return <div className="ccext:min-h-px" />;
  }
  return (
    <ResolvedApp
      productType={productType}
      textarea={textarea}
      isMainComment={isMainComment}
      convention={convention}
    />
  );
}

export default App;
