<script lang="typescript">
  import { setContext } from "svelte";
  import Select from "svelte-select";

  import { LABELS, DECORATIONS, getStore, CONTEXT_KEY } from "./store";
  import SelectItem from "./SelectItem.svelte";
  import OriginalTextareaWrapper from "./OriginalTextareaWrapper.svelte";

  import type { SelectableItem } from "../types";

  export let textarea: HTMLTextAreaElement;
  export let id: string;

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

<style>
  .cc-select-wrapper {
    padding: 10px 0 0 0;
  }
</style>

{#if $isActive}
  <div {style}>
    <OriginalTextareaWrapper {textarea} />
    <div class="cc-select-wrapper" data-qa="label-selector">
      <Select
        items={LABELS}
        Item={SelectItem}
        isClearable={false}
        on:select={onSelectLabel}
        value={$label}
        listPlacement="bottom" />
    </div>
    <div class="cc-select-wrapper" data-qa="decoration-selector">
      <Select
        items={DECORATIONS}
        Item={SelectItem}
        isMulti={true}
        on:select={onSelectDecoration}
        value={$decorations}
        listPlacement="bottom" />
    </div>
  </div>
{/if}
