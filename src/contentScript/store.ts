import { writable, derived } from "svelte/store";
import formatComment from "../helper/formatComment";
import extractComment from "../helper/extractComment";
import getSelectableItemByValue from "../helper/getSelectableItemByValue";
import type { SelectableItem, Store } from "../types";

const LABELS: SelectableItem[] = [
  {
    value: "praise",
    label: "praise",
    description:
      "Praises highlight something positive. Try to leave at least one of these comments per review. _Do not_ leave false praise (which can actually be damaging). _Do_ look for something to sincerely praise.",
  },
  {
    value: "nitpick",
    label: "nitpick",
    description:
      "Nitpicks are small, trivial, but necessary changes. Distinguishing nitpick comments significantly helps direct the reader's attention to comments requiring more involvement.",
  },
  {
    value: "suggestion",
    label: "suggestion",
    description:
      "Suggestions propose improvements to the current subject. It's important to be explicit and clear on _what_ is being suggested and _why_ it is an improvement. Consider using patches and the _blocking_ or _non-blocking_ decorations to further communicate your intent.",
  },
  {
    value: "issue",
    label: "issue",
    description:
      "Issues highlight specific problems with the subject under review. These problems can be user-facing or behind the scenes. It is strongly recommended to pair this comment with a `suggestion`. If you are not sure if a problem exists or not, consider leaving a `question`.",
  },
  {
    value: "question",
    label: "question",
    description:
      "Questions are appropriate if you have a potential concern but are not quite sure if it's relevant or not. Asking the author for clarification or investigation can lead to a quick resolution.",
  },
  {
    value: "thought",
    label: "thought",
    description:
      "Thoughts represent an idea that popped up from reviewing. These comments are non-blocking by nature, but they are extremely valuable and can lead to more focused initiatives and mentoring opportunities.",
  },
  {
    value: "chore",
    label: "chore",
    description:
      'Chores are simple tasks that must be done before the subject can be "officially" accepted. Usually, these comments reference some common process. Try to leave a link to the process description so that the reader knows how to resolve the chore.',
  },
];

const DECORATIONS: SelectableItem[] = [
  {
    value: "non-blocking",
    label: "non-blocking",
    description:
      "A comment with this decoration **should not** prevent the subject under review from being accepted. This is helpful for organizations that consider comments blocking by default.",
  },
  {
    value: "blocking",
    label: "blocking",
    description:
      "A comment with this decoration **should** prevent the subject under review from being accepted, until it is resolved. This is helpful for organizations that consider comments non-blocking by default.",
  },
  {
    value: "if-minor",
    label: "if-minor",
    description:
      "This decoration gives some freedom to the author that they should resolve the comment only if the changes ends up being minor or trivial.",
  },
];

const stores: Map<string, Store> = new Map();

const addStore = (
  id: string,
  isMainComment: boolean,
  textarea: HTMLTextAreaElement
) => {
  const unsubscribeCallbacks: (() => void)[] = [];
  const currentComment = extractComment(
    textarea.value,
    LABELS.map(({ value }) => value),
    DECORATIONS.map(({ value }) => value)
  );
  const defaultIsActive =
    currentComment !== null || (textarea.value === "" && isMainComment);
  const isActive = writable<boolean>(false);
  const label = writable<SelectableItem>(LABELS[0]);
  const decorations = writable<SelectableItem[]>([]);
  const prependedText = derived(
    [label, decorations],
    ([$label, $decorations]) =>
      formatComment(
        $label.value,
        $decorations.map(({ value }) => value)
      )
  );

  unsubscribeCallbacks.push(
    isActive.subscribe((newIsActive) => {
      if (!newIsActive) {
        return;
      }

      const comment = extractComment(
        textarea.value,
        LABELS.map(({ value }) => value),
        DECORATIONS.map(({ value }) => value)
      );
      if (comment !== null) {
        label.set(getSelectableItemByValue(comment.label, LABELS));
        decorations.set(
          comment.decorations.map((decoration) =>
            getSelectableItemByValue(decoration, DECORATIONS)
          )
        );
      }
    })
  );

  isActive.set(defaultIsActive);

  stores.set(id, {
    label,
    decorations,
    prependedText,
    isActive,
    unsubscribeCallbacks,
  });
};

const removeStore = (id: string) => {
  const store = stores.get(id);
  (store?.unsubscribeCallbacks ?? []).forEach((callback) => {
    callback();
  });
  stores.delete(id);
};

const getStore = (id: string): Store => {
  const store = stores.get(id);
  if (store === undefined) {
    throw new Error(`Store not initialized for id '${id}'`);
  }

  return store;
};

const CONTEXT_KEY = {};

export { LABELS, DECORATIONS, addStore, removeStore, getStore, CONTEXT_KEY };
