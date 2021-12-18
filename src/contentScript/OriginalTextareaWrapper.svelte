<script lang="typescript">
  import { onDestroy, getContext } from "svelte";

  import { LABELS, DECORATIONS, CONTEXT_KEY } from "./store";
  import extractComment from "../helper/extractComment";
  import detectModification from "../helper/detectModification";
  import type { Store } from "../types";

  export let textarea: HTMLTextAreaElement;
  const { prependedText } = getContext<Store>(CONTEXT_KEY);

  const EVENTS: (keyof GlobalEventHandlersEventMap)[] = [
    "select",
    "click",
    "focus",
    "keyup",
    "keydown",
  ];

  function updateTexareaSelection() {
    const maxSelection = $prependedText.length;
    if (
      textarea.selectionStart < maxSelection ||
      textarea.selectionEnd < maxSelection
    ) {
      textarea.setSelectionRange(
        Math.max(textarea.selectionStart, maxSelection),
        Math.max(textarea.selectionEnd, maxSelection),
        textarea.selectionDirection
      );
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "Backspace") {
      return;
    }

    const maxSelection = $prependedText.length;
    if (
      textarea.selectionStart === maxSelection &&
      textarea.selectionEnd === maxSelection
    ) {
      event.preventDefault();
    }
  }

  function forceComment() {
    const newValue = detectModification($prependedText, textarea.value);

    if (newValue === null) {
      return;
    }

    textarea.value = newValue;
    const event = new Event("change");
    textarea.dispatchEvent(event);
  }

  onDestroy(() => {
    EVENTS.forEach((eventName) => {
      textarea.removeEventListener(eventName, updateTexareaSelection);
    });
    textarea.removeEventListener("keydown", onKeyDown);
    textarea.removeEventListener("input", forceComment);
    textarea.removeEventListener("focus", forceComment);
  });

  EVENTS.forEach((eventName) => {
    textarea.addEventListener(eventName, updateTexareaSelection);
  });
  textarea.addEventListener("keydown", onKeyDown);
  textarea.addEventListener("input", forceComment);
  textarea.addEventListener("focus", forceComment);

  $: {
    const currentComment = extractComment(
      textarea.value,
      LABELS.map(({ value }) => value),
      DECORATIONS.map(({ value }) => value)
    );

    const previousCommentLength = currentComment?.totalLength ?? 0;
    const selectionShift = $prependedText.length - previousCommentLength;
    const newSelectionStart = textarea.selectionStart + selectionShift;
    const newSelectionEnd = textarea.selectionEnd + selectionShift;
    const newSelectionDirection = textarea.selectionDirection;

    textarea.value =
      $prependedText + textarea.value.substr(previousCommentLength);
    textarea.dispatchEvent(new Event("change"));
    textarea.setSelectionRange(
      newSelectionStart,
      newSelectionEnd,
      newSelectionDirection
    );
    setTimeout(() => {
      textarea.focus();
    }, 0);
  }
</script>
