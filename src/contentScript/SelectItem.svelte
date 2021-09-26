<script lang="typescript">
  import marked from "marked";

  import type { SelectableItem } from "../types";

  export let item: SelectableItem;
  export let isActive: boolean = false;
  export let isHover: boolean = false;

  function onClick(event: MouseEvent) {
    event.preventDefault();
  }
</script>

<button
  on:click={onClick}
  class:cc-ext-hover={isHover}
  class:cc-ext-active={isActive}
  data-qa={`option-${item.label}`}
>
  <span>{item.value}</span>
  {@html marked(item.description)}
</button>

<style>
  button,
  button:focus,
  button:active,
  button:hover {
    display: block;
    color: inherit;
    margin: 0;
    padding: 6px 12px;
    text-decoration: none;
    background-color: #ffffff;
    border: none;
    text-align: left;
    text-decoration: none;
    outline: none;
  }

  button.cc-ext-active {
    background-color: #eee;
  }

  button.cc-ext-hover {
    background-color: #e5e5e5;
  }

  button :global(p) {
    font-size: 0.875rem;
    color: #757575;
    margin: 10px 0 0 0;
  }
</style>
