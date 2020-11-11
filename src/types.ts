import type { Writable, Readable } from "svelte/store";

export interface SelectableItem {
  value: string;
  label: string;
  description: string;
}

export interface Store {
  label: Writable<SelectableItem>;
  decorations: Writable<SelectableItem[]>;
  prependedText: Readable<string>;
  isActive: Writable<boolean>;
  unsubscribeCallbacks: (() => void)[];
}
