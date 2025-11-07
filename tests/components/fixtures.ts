import {
  test as baseTest,
  expect as baseExpect,
  type MountResult,
} from "@playwright/experimental-ct-react";
import { extendExpect } from "../commonMatchers";

export const expect = extendExpect(baseExpect);

class Helpers {
  async setSelectionRange(
    component: MountResult,
    start: number,
    end: number,
  ): Promise<void> {
    const isCorrect = await component.evaluate(
      (_, position: { start: number; end: number }) => {
        const element = document.activeElement;
        if (element === null) {
          return "No active element";
        }
        if (!(element instanceof HTMLTextAreaElement)) {
          return `Active element tag name to be TEXTAREA, got ${element.tagName}`;
        }
        element.setSelectionRange(position.start, position.end);
        return null;
      },
      { start, end },
    );
    expect(isCorrect).toBeNull();
  }
}

export const test = baseTest.extend<{ helpers: Helpers }>({
  helpers: async ({}, use): Promise<void> => {
    const helpers = new Helpers();
    await use(helpers);
  },
});
