import { useState, useEffect } from "react";
import invariant from "tiny-invariant";
import Editor from "./Editor";
import { ProductType } from "../types";
import extractComment from "../helper/extractComment";
import { DECORATIONS, LABELS } from "./constants";
import useTextareaWrapper from "./useTextareaWrapper";

interface AppProps {
  productType: ProductType;
  textarea: HTMLTextAreaElement;
  isMainComment: boolean;
}

const NORMAL_LABELS = LABELS.filter(({ isSpecialItem }) => !isSpecialItem);
const DEACTIVATED_LABEL = LABELS.find(
  (item) => item.isSpecialItem && item.type === "deactivated",
);

function App({ productType, textarea, isMainComment }: AppProps) {
  invariant(DEACTIVATED_LABEL !== undefined, "Deactivated label must exist");
  const [{ label, decorations }, setState] = useState<{
    label: string;
    decorations: string[];
  }>(() => {
    invariant(DEACTIVATED_LABEL !== undefined, "Deactivated label must exist");

    const initialComment = extractComment(
      textarea.value,
      NORMAL_LABELS.map(({ label }) => label),
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
        isMainComment && textarea.value === ""
          ? NORMAL_LABELS[0].label
          : DEACTIVATED_LABEL.label,
      decorations: [],
    };
  });
  const isDeactivated = label === DEACTIVATED_LABEL.label;

  const activeLabel = LABELS.find(
    (currentLabel) => currentLabel.label === label,
  );
  invariant(activeLabel !== undefined, "Current label must exist");
  const currentLabelValue = activeLabel.label;
  const currentDecorationValues = decorations.map((decoration) => {
    const currentDecoration = DECORATIONS.find(
      ({ label }) => label === decoration,
    );
    invariant(currentDecoration !== undefined, "Current decoration must exist");
    return currentDecoration.label;
  });

  useTextareaWrapper(
    textarea,
    !isDeactivated,
    currentLabelValue,
    currentDecorationValues,
  );

  function onSelectLabel(label: string) {
    setState((prev) => ({
      ...prev,
      label,
    }));
  }

  function onToggleDecoration(decoration: string) {
    setState((prev) => ({
      ...prev,
      decorations: prev.decorations.includes(decoration)
        ? prev.decorations.filter((d) => d !== decoration)
        : [...prev.decorations, decoration],
    }));
  }

  return (
    <Editor
      label={label}
      decorations={decorations}
      onSelectLabel={onSelectLabel}
      onToggleDecoration={onToggleDecoration}
      isDeactivated={label === DEACTIVATED_LABEL.label}
    />
  );
}

export default App;
