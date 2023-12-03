<script lang="typescript">
  import { getStore } from "./store";

  export let id: string;
  export let textarea: HTMLTextAreaElement;

  const { isActive, product } = getStore(id);

  let classes = `cc-button-${product}`;
  let iconClasses = `cc-button-icon-${product}`;
  if (product === "github") {
    classes +=
      " flex-auto text-center toolbar-item btn-octicon p-2 p-md-1 mx-1";
    iconClasses += " octicon";
  }
  if (product === "gitlab-v1") {
    classes +=
      " btn gl-mr-2 btn-default btn-sm gl-button btn-default-tertiary btn-icon";
    iconClasses += " gl-button-icon gl-icon s16";
  }
  if (product === "gitlab-v2") {
    classes +=
      " btn gl-mr-2 btn-default btn-sm gl-button btn-default-tertiary btn-icon";
    iconClasses += " gl-button-icon gl-icon s16";
  }

  function handleClick() {
    textarea.focus();
    isActive.update((currentIsActive: boolean) => !currentIsActive);
  }
</script>

<span
  on:click={handleClick}
  aria-label="Insert conventional comment"
  type="button"
  data-container="body"
  class={classes}
  data-qa="toggle-button"
>
  <svg
    class={iconClasses}
    class:cc-active={$isActive}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0 16V2L2 0H14L16 2V13L14 15H4L0 16ZM2 3L3 2H13L14 3V12L13 13H2V3Z"
    />
    <circle cx="8" cy="5.5" r="1.5" />
    <circle cx="8" cy="9.5" r="1.5" />
  </svg>
</span>

<style>
  .cc-button-icon-github {
    fill: currentColor;
  }

  .cc-button-icon-github.cc-active {
    fill: var(--color-accent-fg);
  }

  .cc-button-icon-gitlab-v1.cc-active {
    fill: var(--primary);
  }

  .cc-button-icon-gitlab-v2.cc-active {
    fill: var(--primary);
  }
</style>
