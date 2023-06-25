<script lang="typescript">
  import { setContext } from "svelte";
  import Select from "svelte-select";

  import { LABELS, DECORATIONS, getStore, CONTEXT_KEY } from "./store";
  import SelectItem from "./SelectItem.svelte";
  import OriginalTextareaWrapper from "./OriginalTextareaWrapper.svelte";

  import type { SelectableItem } from "../types";

  export let textarea: HTMLTextAreaElement;
  export let id: string;

  const { label, decorations, prependedText, isActive, product } = getStore(id);
  setContext(CONTEXT_KEY, { label, decorations, prependedText, product });

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

  let isSelectLabelOpen = false;
  let isSelectDecorationOpen = false;
</script>

{#if $isActive}
  <div data-qa="editor-container">
    <OriginalTextareaWrapper {textarea} />
    <div
      class={`cc-select-wrapper-${product}`}
      class:cc-select-wrapper-focussed={isSelectLabelOpen}
      data-qa="label-selector"
    >
      <Select
        items={LABELS}
        Item={SelectItem}
        isClearable={false}
        on:select={onSelectLabel}
        value={$label}
        listPlacement="bottom"
        bind:listOpen={isSelectLabelOpen}
      />
    </div>
    <div
      class={`cc-select-wrapper-${product}`}
      class:cc-select-wrapper-focussed={isSelectDecorationOpen}
      data-qa="decoration-selector"
    >
      <Select
        items={DECORATIONS}
        Item={SelectItem}
        isMulti={true}
        on:select={onSelectDecoration}
        value={$decorations}
        listPlacement="bottom"
        bind:listOpen={isSelectDecorationOpen}
      />
    </div>
  </div>
{/if}

<style lang="scss">
  .cc-select-wrapper-gitlab {
    padding: 10px 0.25rem 0 0.25rem;
    text-align: left;
    color: #303030;
    --inputColor: #303030;
    --border: none;
    --borderRadius: 0.25rem;
    --background: #fff;
    --listBackground: var(--white);
    --listBorder: 1px solid #dbdbdb;
    --listBorderRadius: 0.25rem;
    --listEmptyPadding: 8px 0;
    --listShadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    --clearSelectColor: #666;
    --clearSelectFocusColor: #666;
    --clearSelectHoverColor: var(--primary);
    --multiClearBG: transparent;
    --multiClearHoverBG: transparent;
    --multiClearFill: var(--primary);
    --multiClearHoverFill: var(--primary);
    > :global(.selectContainer) {
      box-shadow: inset 0 0 0 1px #bfbfbf;
      transition: 100ms linear;
      transition-property: box-shadow, background;
    }
    &.cc-select-wrapper-focussed,
    &:hover {
      > :global(.selectContainer) {
        box-shadow: inset 0 0 0 2px #868686, 0 2px 2px 0 rgba(0, 0, 0, 0.08);
        background: #f0f0f0;
      }
    }
  }

  :global(body.gl-dark) .cc-select-wrapper-gitlab {
    color: #fafafa;
    --inputColor: #fafafa;
    --background: #333;
    --listBackground: #333;
    --listBorder: 1px solid #404040;
    --multiItemBG: var(--gray-200);
    --multiItemActiveBG: var(--gray-200);
    --multiItemActiveColor: #fafafa;
    --clearSelectColor: #999;
    --clearSelectFocusColor: #999;
    > :global(.selectContainer) {
      box-shadow: inset 0 0 0 1px #525252;
    }

    &.cc-select-wrapper-focussed,
    &:hover {
      > :global(.selectContainer) {
        box-shadow: inset 0 0 0 2px #868686, 0 2px 2px 0 rgba(0, 0, 0, 0.08);
        background: #303030;
      }
    }
  }

  .cc-select-wrapper-github {
    color: var(--color-fg-default);
    --inputColor: var(--color-fg-default);
    margin: 0 8px 8px;
    --background: var(--color-btn-bg);
    &.cc-select-wrapper-focussed,
    &:hover {
      --background: var(--color-btn-hover-bg);
    }
    --border: 1px solid var(--color-btn-border);
    --borderFocusColor: var(--color-btn-focus-border);
    --borderHoverColor: var(--color-btn-hover-border);
    --borderRadius: 6px;
    --clearSelectColor: var(--color-fg-muted);
    --clearSelectFocusColor: var(--color-fg-muted);
    --clearSelectHoverColor: var(--color-accent-fg);
    --listBackground: var(--color-canvas-overlay);
    --listBorder: 1px solid var(--color-border-default);
    --listBorderRadius: 6px;
    --listShadow: var(--color-shadow-large);
    --multiItemBG: var(--color-neutral-muted);
    --multiItemActiveBG: var(--color-neutral-muted);
    --multiItemActiveColor: var(--color-fg-default);
    --multiClearBG: transparent;
    --multiClearHoverBG: transparent;
    --multiClearFill: var(--color-fg-default);
    --multiClearHoverFill: var(--color-accent-fg);

    > :global(.selectContainer) {
      transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
      transition-property: color, background-color, border-color;
    }
  }

  /* Ensure there is enough place to show the full list */
  :global(textarea#note_note) {
    min-height: 188px;
  }
</style>
