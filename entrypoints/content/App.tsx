import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

interface EditorState {
  label: string;
  decorations: string[];
}

function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
  // Avoids keyboard shortcuts from being triggered when typing in an input
  if (e.target instanceof HTMLInputElement) {
    e.stopPropagation();
  }
}

function computeInitialState(
  convention: ConventionFile,
  textarea: HTMLTextAreaElement,
  isMainComment: boolean,
): EditorState {
  const labelNames = convention.labels.map(({ label }) => label);
  const decorationNames = convention.decorations.map(({ label }) => label);
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
}

function ResolvedApp({
  productType,
  textarea,
  isMainComment,
  convention,
}: ResolvedAppProps): ReactElement {
  const [{ label, decorations }, setState] = useState<EditorState>(() =>
    computeInitialState(convention, textarea, isMainComment),
  );

  // When the convention swaps mid-mount (default → custom fetched), reset
  // state to the new convention's default. We deliberately ignore the current
  // textarea.value here: it still carries the previous convention's prefix
  // (written by useTextareaWrapper), so re-running extractComment against the
  // new vocab would always fail and we'd fall through to EMPTY_LABEL.
  // useTextareaWrapper's existing slice-based effect rewrites the prefix on
  // the next render once `label`/`decorations` change, so we don't touch
  // textarea.value directly here.
  const prevConventionRef = useRef(convention);
  useEffect(() => {
    if (prevConventionRef.current === convention) {
      return;
    }
    prevConventionRef.current = convention;
    setState({
      label: isMainComment
        ? (convention.defaultLabel ?? EMPTY_LABEL)
        : EMPTY_LABEL,
      decorations: [],
    });
  }, [convention, isMainComment]);

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
