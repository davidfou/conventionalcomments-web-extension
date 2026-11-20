import type { ReactElement } from "react";
import { Combobox } from "~/components/custom/Combobox";
import { ProductType } from "./types";
import type { SelectableItem } from "./convention/types";

interface EditorProps {
  productType: ProductType;
  label: string;
  selectedDecorations: string[];
  labels: readonly SelectableItem[];
  decorations: readonly SelectableItem[];
  emptyLabel: string;
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
  selectedDecorations,
  labels,
  decorations,
  emptyLabel,
  onSelectLabel,
  onToggleDecoration,
  onAction,
}: EditorProps): ReactElement {
  return (
    <div
      className="ccext:m-(--ccext-margin) ccext:space-y-(--ccext-margin)"
      data-testid="editor"
      data-testlabel={label}
      data-testdecorations={selectedDecorations.join(", ")}
    >
      <Combobox
        data-testid="label-combobox"
        productType={productType}
        label="Select label to apply"
        isMulti={false}
        emptyValue={emptyLabel}
        placeholder="Select label..."
        searchPlaceholder="Search labels..."
        options={labels}
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
        options={decorations}
        values={selectedDecorations}
        emptyState={DECORATION_EMPTY_STATE}
        onToggle={onToggleDecoration}
        onAction={onAction}
      />
    </div>
  );
}

export default Editor;
