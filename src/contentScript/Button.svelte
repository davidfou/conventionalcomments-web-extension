<script lang="typescript">
  import { getStore } from "./store";

  export let id: string;
  export let textarea: HTMLTextAreaElement;

  const { isActive } = getStore(id);

  function handleClick() {
    textarea.focus();
    isActive.update((currentIsActive: boolean) => !currentIsActive);
  }
</script>

<style>
  .cc-active {
    fill: #1068bf;
  }
</style>

<button
  on:click={handleClick}
  title="Insert conventional comment"
  aria-label="Insert conventional comment"
  type="button"
  data-container="body"
  class="toolbar-btn js-md"
  data-qa="toggle-button">
  <svg
    class="gl-icon s16"
    class:cc-active={$isActive}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0 16V2L2 0H14L16 2V13L14 15H4L0 16ZM2 3L3 2H13L14 3V12L13 13H2V3Z" />
    <circle cx="8" cy="5.5" r="1.5" />
    <circle cx="8" cy="9.5" r="1.5" />
  </svg>
</button>
