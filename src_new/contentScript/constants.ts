interface BaseSelectableItem {
  label: string;
  description: string;
}

interface NormalLabel extends BaseSelectableItem {
  isSpecialItem: false;
}

interface SpecialLabel extends BaseSelectableItem {
  isSpecialItem: true;
  type: "deactivated";
}

type SelectableLabel = NormalLabel | SpecialLabel;

const LABELS: Readonly<Readonly<SelectableLabel>[]> = [
  {
    label: "praise",
    description:
      "Praises highlight something positive. Try to leave at least one of these comments per review. _Do not_ leave false praise (which can actually be damaging). _Do_ look for something to sincerely praise.",
    isSpecialItem: false,
  },
  {
    label: "nitpick",
    description:
      "Nitpicks are small, trivial, but necessary changes. Distinguishing nitpick comments significantly helps direct the reader's attention to comments requiring more involvement.",
    isSpecialItem: false,
  },
  {
    label: "suggestion",
    description:
      "Suggestions propose improvements to the current subject. It's important to be explicit and clear on _what_ is being suggested and _why_ it is an improvement. Consider using patches and the _blocking_ or _non-blocking_ decorations to further communicate your intent.",
    isSpecialItem: false,
  },
  {
    label: "issue",
    description:
      "Issues highlight specific problems with the subject under review. These problems can be user-facing or behind the scenes. It is strongly recommended to pair this comment with a `suggestion`. If you are not sure if a problem exists or not, consider leaving a `question`.",
    isSpecialItem: false,
  },
  {
    label: "todo",
    description:
      "TODO's are small, trivial, but necessary changes. Distinguishing todo comments from issues: or suggestions: helps direct the reader's attention to comments requiring more involvement.",
    isSpecialItem: false,
  },
  {
    label: "question",
    description:
      "Questions are appropriate if you have a potential concern but are not quite sure if it's relevant or not. Asking the author for clarification or investigation can lead to a quick resolution.",
    isSpecialItem: false,
  },
  {
    label: "thought",
    description:
      "Thoughts represent an idea that popped up from reviewing. These comments are non-blocking by nature, but they are extremely valuable and can lead to more focused initiatives and mentoring opportunities.",
    isSpecialItem: false,
  },
  {
    label: "chore",
    description:
      'Chores are simple tasks that must be done before the subject can be "officially" accepted. Usually, these comments reference some common process. Try to leave a link to the process description so that the reader knows how to resolve the chore.',
    isSpecialItem: false,
  },
  {
    label: "note",
    description:
      "Notes are always non-blocking and simply highlight something the reader should take note of.",
    isSpecialItem: false,
  },
  {
    label: "typo",
    description:
      "Typo comments are like **todo**, where the main issue is a mispelling.",
    isSpecialItem: false,
  },
  {
    label: "polish",
    description:
      "Polish comments are like a **suggestion**, where there is nothing necessarily wrong with the relevant content, there's just some ways to immediately improve the quality.",
    isSpecialItem: false,
  },
  {
    label: "deactivate",
    description: "This label is used to skip the convention.",
    isSpecialItem: true,
    type: "deactivated",
  },
];

const DECORATIONS: Readonly<Readonly<BaseSelectableItem>[]> = [
  {
    label: "non-blocking",
    description:
      "A comment with this decoration **should not** prevent the subject under review from being accepted. This is helpful for organizations that consider comments blocking by default.",
  },
  {
    label: "blocking",
    description:
      "A comment with this decoration **should** prevent the subject under review from being accepted, until it is resolved. This is helpful for organizations that consider comments non-blocking by default.",
  },
  {
    label: "if-minor",
    description:
      "This decoration gives some freedom to the author that they should resolve the comment only if the changes ends up being minor or trivial.",
  },
];

export { LABELS, DECORATIONS };
