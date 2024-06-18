import { test, expect } from "@playwright/experimental-ct-react";
import { setSelectionRange } from "@/tests/helpers";

import WrappedApp from "./__fixtures__/WrappedApp";

test.use({ viewport: { width: 500, height: 500 } });

test("Selecting controlled text brings cursor to the start", async ({
  mount,
  page,
}) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  await expect(component.getByTestId("textarea")).toBeFocused();
  await page.keyboard.type("my comment");
  await setSelectionRange(page, 0, 6);
  await expect(component.getByTestId("textarea")).toHaveSelectedText(12, 12);
});

test("Selecting controlled text and part of the comment selects only the comment part", async ({
  mount,
  page,
}) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  await expect(component.getByTestId("textarea")).toBeFocused();
  await page.keyboard.type("my comment");
  await setSelectionRange(page, 5, 16);
  await expect(component.getByTestId("textarea")).toHaveSelectedText(12, 16);
});

test("Using left key works cannot reaches the controlled part", async ({
  mount,
  page,
}) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  await expect(component.getByTestId("textarea")).toBeFocused();
  await page.keyboard.type("my");
  await expect(component.getByTestId("textarea")).toHaveSelectedText(14, 14);
  await page.keyboard.press("ArrowLeft");
  await expect(component.getByTestId("textarea")).toHaveSelectedText(13, 13);
  await page.keyboard.press("ArrowLeft");
  await expect(component.getByTestId("textarea")).toHaveSelectedText(12, 12);
  await page.keyboard.press("ArrowLeft");
  await expect(component.getByTestId("textarea")).toHaveSelectedText(12, 12);
});

test("Using up key cannot reaches the controlled part", async ({
  mount,
  page,
}) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  await expect(component.getByTestId("textarea")).toBeFocused();
  await page.keyboard.type("my");
  await expect(component.getByTestId("textarea")).toHaveSelectedText(14, 14);
  await page.keyboard.press("ArrowUp");
  await expect(component.getByTestId("textarea")).toHaveSelectedText(12, 12);
  await page.keyboard.press("ArrowDown");
  await expect(component.getByTestId("textarea")).toHaveSelectedText(14, 14);
  await page.keyboard.type("\nline");
  await expect(component.getByTestId("textarea")).toHaveSelectedText(19, 19);
  await page.keyboard.press("ArrowUp");
  await expect(component.getByTestId("textarea")).toHaveSelectedText(12, 12);
});
