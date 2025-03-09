import { test, expect } from "../fixtures";
import { WrappedApp } from "./App.story.tsx";

const testCases: {
  isMainComment: boolean;
  defaultTextareaValue: string;
  expectedLabel: string;
  expectedDecorations: string[];
  expectedTextareaValue: string;
}[] = [
  {
    isMainComment: true,
    defaultTextareaValue: "",
    expectedLabel: "praise",
    expectedDecorations: [],
    expectedTextareaValue: "**praise:** ",
  },
  {
    isMainComment: false,
    defaultTextareaValue: "",
    expectedLabel: "none",
    expectedDecorations: [],
    expectedTextareaValue: "",
  },
  {
    isMainComment: true,
    defaultTextareaValue: "Random text...",
    expectedLabel: "none",
    expectedDecorations: [],
    expectedTextareaValue: "Random text...",
  },
  {
    isMainComment: false,
    defaultTextareaValue: "Random text...",
    expectedLabel: "none",
    expectedDecorations: [],
    expectedTextareaValue: "Random text...",
  },
  {
    isMainComment: true,
    defaultTextareaValue: "**unkown:** existing comment",
    expectedLabel: "none",
    expectedDecorations: [],
    expectedTextareaValue: "**unkown:** existing comment",
  },
  {
    isMainComment: false,
    defaultTextareaValue: "**unkown:** existing comment",
    expectedLabel: "none",
    expectedDecorations: [],
    expectedTextareaValue: "**unkown:** existing comment",
  },
  {
    isMainComment: true,
    defaultTextareaValue: "**issue (unkown):** existing comment",
    expectedLabel: "none",
    expectedDecorations: [],
    expectedTextareaValue: "**issue (unkown):** existing comment",
  },
  {
    isMainComment: false,
    defaultTextareaValue: "**issue (unkown):** existing comment",
    expectedLabel: "none",
    expectedDecorations: [],
    expectedTextareaValue: "**issue (unkown):** existing comment",
  },
  {
    isMainComment: true,
    defaultTextareaValue: "**issue:** existing comment",
    expectedLabel: "issue",
    expectedDecorations: [],
    expectedTextareaValue: "**issue:** existing comment",
  },
  {
    isMainComment: false,
    defaultTextareaValue: "**issue:** existing comment",
    expectedLabel: "issue",
    expectedDecorations: [],
    expectedTextareaValue: "**issue:** existing comment",
  },
  {
    isMainComment: true,
    defaultTextareaValue: "**issue (blocking):** existing comment",
    expectedLabel: "issue",
    expectedDecorations: ["blocking"],
    expectedTextareaValue: "**issue (blocking):** existing comment",
  },
  {
    isMainComment: false,
    defaultTextareaValue: "**issue (blocking):** existing comment",
    expectedLabel: "issue",
    expectedDecorations: ["blocking"],
    expectedTextareaValue: "**issue (blocking):** existing comment",
  },
  {
    isMainComment: true,
    defaultTextareaValue: "**issue (blocking, if-minor):** existing comment",
    expectedLabel: "issue",
    expectedDecorations: ["blocking", "if-minor"],
    expectedTextareaValue: "**issue (blocking, if-minor):** existing comment",
  },
  {
    isMainComment: false,
    defaultTextareaValue: "**issue (blocking, if-minor):** existing comment",
    expectedLabel: "issue",
    expectedDecorations: ["blocking", "if-minor"],
    expectedTextareaValue: "**issue (blocking, if-minor):** existing comment",
  },
  {
    isMainComment: true,
    defaultTextareaValue: "**issue (blocking, if-minor):** ",
    expectedLabel: "issue",
    expectedDecorations: ["blocking", "if-minor"],
    expectedTextareaValue: "**issue (blocking, if-minor):** ",
  },
  {
    isMainComment: false,
    defaultTextareaValue: "**issue (blocking, if-minor):** ",
    expectedLabel: "issue",
    expectedDecorations: ["blocking", "if-minor"],
    expectedTextareaValue: "**issue (blocking, if-minor):** ",
  },
];
for (const {
  isMainComment,
  defaultTextareaValue,
  expectedLabel,
  expectedDecorations,
  expectedTextareaValue,
} of testCases) {
  test(`initialize the textarea and the combobox with isMainComment=${isMainComment} and defaultTextareaValue="${defaultTextareaValue}"`, async ({
    mount,
  }) => {
    const component = await mount(
      <WrappedApp
        isMainComment={isMainComment}
        defaultTextareaValue={defaultTextareaValue}
      />,
    );
    await expect
      .soft(
        component.getByTestId("label-combobox").getByTestId("combobox-value"),
      )
      .toHaveAttribute("data-testvalue", expectedLabel);
    await expect
      .soft(
        component
          .getByTestId("decorations-combobox")
          .getByTestId("combobox-value"),
      )
      .toHaveAttribute("data-testvalue", expectedDecorations.join("|"));
    await expect
      .soft(component.getByTestId("textarea"))
      .toHaveValue(expectedTextareaValue);
  });
}
