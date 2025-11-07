import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";

async function extractSelection(locator: Locator): Promise<{
  actual: { start: number; end: number } | null;
  customMessage: string | null;
}> {
  let actual: { start: number; end: number } | null = null;
  let customMessage: string | null = null;
  const result = await locator.evaluate(
    (
      node: unknown,
    ):
      | { success: false; customMessage: string }
      | {
          success: true;
          start: number;
          end: number;
        } => {
      if (!(node instanceof HTMLTextAreaElement)) {
        return {
          success: false,
          customMessage: "the selector is not a textarea",
        };
      }
      return {
        success: true,
        start: node.selectionStart,
        end: node.selectionEnd,
      };
    },
  );
  if (result.success) {
    actual = { start: result.start, end: result.end };
  } else {
    customMessage = result.customMessage;
    actual = null;
  }
  return { actual, customMessage };
}

// oxlint-disable-next-line typescript/explicit-function-return-type,typescript/explicit-module-boundary-types
export function extendExpect(baseExpect: typeof expect) {
  return baseExpect.extend({
    async toHaveSelectedText(
      locator: Locator,
      expected: { start: number; end: number },
    ) {
      const assertionName = "toHaveSelectedText";
      let pass: boolean;
      let actual: { start: number; end: number } | null = null;
      let customMessage: string | null = null;

      try {
        let assertion = baseExpect.poll(async () => {
          const extracedSelection = await extractSelection(locator);
          customMessage = extracedSelection.customMessage;
          actual = extracedSelection.actual;
          return extracedSelection.actual;
        });

        if (this.isNot) {
          assertion = assertion.not;
        }

        await assertion.toEqual(expected);
        pass = true;
      } catch (error: unknown) {
        pass = false;
        if (error instanceof Error) {
          customMessage ??= error.message;
        }
      }

      if (this.isNot) {
        pass = !pass;
      }

      return {
        message: (): string => customMessage ?? "Assertion failed",
        pass,
        name: assertionName,
        expected,
        actual,
      };
    },
  });
}
