import DEFAULT_CONVENTION from "./convention/defaultConvention";
import { EMPTY_LABEL, EMPTY_LABEL_ENTRY } from "./convention/emptyLabel";
import type { SelectableItem } from "./convention/types";

const LABELS: Readonly<Readonly<SelectableItem>[]> = [
  EMPTY_LABEL_ENTRY,
  ...DEFAULT_CONVENTION.labels,
];

const DECORATIONS: Readonly<Readonly<SelectableItem>[]> =
  DEFAULT_CONVENTION.decorations;

export { EMPTY_LABEL, LABELS, DECORATIONS };
