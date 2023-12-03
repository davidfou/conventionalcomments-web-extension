<script lang="typescript">
  import marked from "marked";
  import dompurify from "dompurify";
  import { getContext } from "svelte";

  import type { SelectableItem, ProductType, Store } from "../types";
  import { CONTEXT_KEY } from "./store";

  export let item: SelectableItem;
  export let isActive: boolean = false;
  export let isHover: boolean = false;

  function onClick(event: MouseEvent) {
    event.preventDefault();
  }
  const { product } = getContext<Store>(CONTEXT_KEY);

  const VALUE_CLASS: Record<ProductType, string> = {
    "github-v1": "f5 text-bold",
    "github-v2": "f5 text-bold",
    "gitlab-v1": "",
    "gitlab-v2": "",
  };
  const DESCRIPTION_CLASS: Record<ProductType, string> = {
    "github-v1": "text-small color-text-secondary text-normal pb-1",
    "github-v2": "text-small color-text-secondary text-normal pb-1",
    "gitlab-v1": "",
    "gitlab-v2": "",
  };
</script>

<button
  on:click={onClick}
  class={`cc-select-item-${product}`}
  class:cc-ext-hover={isHover}
  class:cc-ext-active={isActive}
  data-qa={`option-${item.label}`}
>
  <div class={VALUE_CLASS[product]}>{item.value}</div>
  <div class={DESCRIPTION_CLASS[product]}>
    {@html dompurify.sanitize(marked.parseInline(item.description))}
  </div>
</button>

<style lang="scss">
  button,
  button:focus,
  button:active,
  button:hover {
    display: block;
    margin: 0;
    padding: 6px 12px;
    text-decoration: none;
    border: none;
    text-align: left;
    text-decoration: none;
    outline: none;
    width: 100%;

    &.cc-select-item-gitlab-v1 {
      color: var(--gl-text-color);
      background: transparent;

      &.cc-ext-hover,
      &.cc-ext-active {
        background: #eee;
      }
    }

    &.cc-select-item-gitlab-v2 {
      color: var(--gl-text-color);
      background: transparent;

      &.cc-ext-hover,
      &.cc-ext-active {
        background: #eee;
      }
    }

    &.cc-select-item-github-v1 {
      color: var(--color-fg-default);
      background-color: var(--color-canvas-overlay);

      &.cc-ext-hover,
      &.cc-ext-active {
        background-color: var(--color-neutral-subtle);
      }
    }

    &.cc-select-item-github-v2 {
      color: var(--color-fg-default);
      background-color: var(--color-canvas-overlay);

      &.cc-ext-hover,
      &.cc-ext-active {
        background-color: var(--color-neutral-subtle);
      }
    }
  }

  :global(body.gl-dark) button.cc-select-item-gitlab-v1 {
    &.cc-ext-hover,
    &.cc-ext-active {
      background: var(--gray-200);
    }
  }

  :global(html.gl-dark) button.cc-select-item-gitlab-v2 {
    &.cc-ext-hover,
    &.cc-ext-active {
      background: var(--gray-200);
    }
  }
</style>
