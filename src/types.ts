import type { Writable, Readable } from "svelte/store";

import type PRODUCT_TYPES from "./constants/PRODUCT_TYPES";

export interface SelectableItem {
  value: string;
  label: string;
  description: string;
}

export type ProductType = typeof PRODUCT_TYPES[number];

export interface Store {
  label: Writable<SelectableItem>;
  decorations: Writable<SelectableItem[]>;
  prependedText: Readable<string>;
  isActive: Writable<boolean>;
  unsubscribeCallbacks: (() => void)[];
  product: ProductType;
}
