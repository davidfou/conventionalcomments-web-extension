import type { Page } from "@playwright/test";

export async function setSelectionRange(
  page: Page,
  start: number,
  end: number,
) {
  await page.evaluate(
    (position) => {
      const element = document.activeElement;
      if (element === null) {
        throw new Error("No active element");
      }
      if (element.tagName !== "TEXTAREA") {
        throw new Error(
          `Active element tag name to be TEXTAREA, got ${element.tagName}`,
        );
      }
      (<HTMLTextAreaElement>element).setSelectionRange(
        position.start,
        position.end,
      );
    },
    { start, end },
  );
}
