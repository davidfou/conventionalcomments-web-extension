import { test, expect } from "../fixtures.ts";
import { WrappedApp } from "./App.story.tsx";

test("selecting controlled text brings cursor to the start", async ({
  mount,
  page,
  helpers,
}) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await expect(component.getByTestId("textarea")).toBeFocused();
  await page.keyboard.type("my comment");
  await helpers.setSelectionRange(component, 0, 6);
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 12,
    end: 12,
  });
});

test("using left key works cannot reaches the controlled part", async ({
  mount,
  page,
}) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await expect(component.getByTestId("textarea")).toBeFocused();
  await page.keyboard.type("my");
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 14,
    end: 14,
  });
  await page.keyboard.press("ArrowLeft");
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 13,
    end: 13,
  });
  await page.keyboard.press("ArrowLeft");
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 12,
    end: 12,
  });
  await page.keyboard.press("ArrowLeft");
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 12,
    end: 12,
  });
});

test("using up key cannot reaches the controlled part", async ({
  mount,
  page,
}) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await expect(component.getByTestId("textarea")).toBeFocused();
  await page.keyboard.type("my");
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 14,
    end: 14,
  });
  await page.keyboard.press("ArrowUp");
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 12,
    end: 12,
  });
  await page.keyboard.press("ArrowDown");
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 14,
    end: 14,
  });
  await page.keyboard.type("\nline");
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 19,
    end: 19,
  });
  await page.keyboard.press("ArrowUp");
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 12,
    end: 12,
  });
});

test("select all shorcut selects only the uncontrolled part", async ({
  mount,
  page,
}) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await expect(component.getByTestId("textarea")).toBeFocused();
  await page.keyboard.type("my comment");
  await page.keyboard.press("ControlOrMeta+a");
  await expect(component.getByTestId("textarea")).toHaveSelectedText({
    start: 12,
    end: 22,
  });
});
