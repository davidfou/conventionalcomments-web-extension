import { useEffect, useRef } from "react";
import detectModification from "./detectModification";
import formatComment from "./formatComment";
import { EMPTY_LABEL } from "./constants";

const EVENTS = ["select", "click", "focus", "keyup", "keydown"] as const;

function useTextareaPrefix(
  textarea: HTMLTextAreaElement,
  label: string,
  decorations: string[],
  isActive: boolean,
  prependedText: React.RefObject<string>,
): void {
  useEffect(() => {
    const previousPrependedTextLength = prependedText.current.length;
    prependedText.current = isActive ? formatComment(label, decorations) : "";

    const selectionShift =
      prependedText.current.length - previousPrependedTextLength;
    const newSelectionStart = textarea.selectionStart + selectionShift;
    const newSelectionEnd = textarea.selectionEnd + selectionShift;
    const newSelectionDirection = textarea.selectionDirection;

    textarea.value =
      prependedText.current + textarea.value.slice(previousPrependedTextLength);

    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
    textarea.setSelectionRange(
      newSelectionStart,
      newSelectionEnd,
      newSelectionDirection,
    );
  }, [textarea, isActive, label, decorations, prependedText]);
}

function updateTextareaSelection(
  textarea: HTMLTextAreaElement,
  prependedText: React.RefObject<string>,
): void {
  const maxSelection = prependedText.current.length;
  if (
    textarea.selectionStart < maxSelection ||
    textarea.selectionEnd < maxSelection
  ) {
    textarea.setSelectionRange(
      Math.max(textarea.selectionStart, maxSelection),
      Math.max(textarea.selectionEnd, maxSelection),
      textarea.selectionDirection,
    );
  }
}

function onKeyDown(
  event: KeyboardEvent,
  textarea: HTMLTextAreaElement,
  prependedText: React.RefObject<string>,
): void {
  if (event.key !== "Backspace") {
    return;
  }

  const maxSelection = prependedText.current.length;
  if (
    textarea.selectionStart === maxSelection &&
    textarea.selectionEnd === maxSelection
  ) {
    event.preventDefault();
  }
}

function forceComment(
  textarea: HTMLTextAreaElement,
  prependedText: React.RefObject<string>,
): void {
  const newValue = detectModification(prependedText.current, textarea.value);

  if (newValue === null) {
    return;
  }

  textarea.value = newValue;
  textarea.dispatchEvent(new Event("change"));
}

function useKeepTextareaInSync(
  textarea: HTMLTextAreaElement,
  isActive: boolean,
  prependedText: React.RefObject<string>,
): void {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const onKeyDownHandler = (event: KeyboardEvent): void =>
      onKeyDown(event, textarea, prependedText);
    const updateTextareaSelectionHandler = (): void =>
      updateTextareaSelection(textarea, prependedText);
    const forceCommentHandler = (): void =>
      forceComment(textarea, prependedText);
    for (const eventName of EVENTS) {
      textarea.addEventListener(eventName, updateTextareaSelectionHandler);
    }

    textarea.addEventListener("keydown", onKeyDownHandler);
    textarea.addEventListener("input", forceCommentHandler);
    textarea.addEventListener("focus", forceCommentHandler);
    return (): void => {
      for (const eventName of EVENTS) {
        textarea.removeEventListener(eventName, updateTextareaSelectionHandler);
      }

      textarea.removeEventListener("keydown", onKeyDownHandler);
      textarea.removeEventListener("input", forceCommentHandler);
      textarea.removeEventListener("focus", forceCommentHandler);
    };
  }, [textarea, isActive, prependedText]);
}

function useTextareaWrapper(
  textarea: HTMLTextAreaElement,
  label: string,
  decorations: string[],
): void {
  const isActive = label !== EMPTY_LABEL;
  const prependedText = useRef(
    isActive ? formatComment(label, decorations) : "",
  );

  useTextareaPrefix(textarea, label, decorations, isActive, prependedText);
  useKeepTextareaInSync(textarea, isActive, prependedText);
}

export default useTextareaWrapper;
