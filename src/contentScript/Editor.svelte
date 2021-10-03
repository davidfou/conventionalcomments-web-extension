<script lang="typescript">
  import { setContext } from "svelte";
  import Select from "svelte-select";

  import { LABELS, DECORATIONS, getStore, CONTEXT_KEY } from "./store";
  import SelectItem from "./SelectItem.svelte";
  import OriginalTextareaWrapper from "./OriginalTextareaWrapper.svelte";

  import type { SelectableItem, ProductType } from "../types";

  export let textarea: HTMLTextAreaElement;
  export let id: string;
  export let product: ProductType;

  const { label, decorations, prependedText, isActive } = getStore(id);
  setContext(CONTEXT_KEY, { label, decorations, prependedText });

  function onSelectLabel(event: { detail: SelectableItem }) {
    label.set(event.detail);
  }

  function onSelectDecoration(event: { detail: SelectableItem[] | null }) {
    if (event.detail === null) {
      decorations.set([]);
    } else {
      decorations.set(event.detail);
    }
  }

  const style = `color: ${getComputedStyle(textarea).color};`;
</script>

{#if $isActive}
  <div data-qa="editor-container" {style}>
    <OriginalTextareaWrapper {textarea} />
    <div class={`cc-select-wrapper-${product}`} data-qa="label-selector">
      <Select
        items={LABELS}
        Item={SelectItem}
        isClearable={false}
        on:select={onSelectLabel}
        value={$label}
        listPlacement="bottom"
      />
    </div>
    <div class={`cc-select-wrapper-${product}`} data-qa="decoration-selector">
      <Select
        items={DECORATIONS}
        Item={SelectItem}
        isMulti={true}
        on:select={onSelectDecoration}
        value={$decorations}
        listPlacement="bottom"
      />
    </div>
  </div>
{/if}

<style>
  .cc-select-wrapper-gitlab {
    padding: 10px 0 0 0;
  }

  .cc-select-wrapper-github {
    margin: 0 8px 8px;
  }
</style>
