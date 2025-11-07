import type { ReactElement } from "react";
import { DECORATIONS, EMPTY_LABEL, LABELS } from "./constants";
import { Combobox } from "~/components/custom/Combobox";
import { ProductType } from "./types";

interface EditorProps {
  productType: ProductType;
  label: string;
  decorations: string[];
  onSelectLabel: (label: string) => void;
  onToggleDecoration: (decoration: string) => void;
  onAction: () => void;
}

const LABEL_EMPTY_STATE = {
  title: "No labels were found",
  description: "Please try a different search query",
};

const DECORATION_EMPTY_STATE = {
  title: "No decorations found",
  description: "Please try a different search query",
};

function Editor({
  productType,
  label,
  decorations,
  onSelectLabel,
  onToggleDecoration,
  onAction,
}: EditorProps): ReactElement {
  return (
    <div
      className="ccext:m-(--ccext-margin) ccext:space-y-(--ccext-margin)"
      data-testid="editor"
      data-testlabel={label}
      data-testdecorations={decorations.join(", ")}
    >
      <Combobox
        data-testid="label-combobox"
        productType={productType}
        label="Select label to apply"
        isMulti={false}
        emptyValue={EMPTY_LABEL}
        placeholder="Select label..."
        searchPlaceholder="Search labels..."
        options={LABELS}
        value={label}
        emptyState={LABEL_EMPTY_STATE}
        onSelect={onSelectLabel}
        onAction={onAction}
      />
      <Combobox
        data-testid="decorations-combobox"
        productType={productType}
        label="Select decorations to apply"
        isMulti
        placeholder="Add decorations..."
        searchPlaceholder="Search decorations..."
        options={DECORATIONS}
        values={decorations}
        emptyState={DECORATION_EMPTY_STATE}
        onToggle={onToggleDecoration}
        onAction={onAction}
      />
    </div>
  );
}

export default Editor;
