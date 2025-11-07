import { test, expect } from "../fixtures";
import { WrappedApp } from "./App.story.tsx";

test("select another label", async ({ mount, page, helpers }) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await page.keyboard.type("hello world");
  await helpers.setSelectionRange(component, 18, 20);
  await component
    .getByTestId("label-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="nitpick"]'))
    .click();

  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveValue("**nitpick:** hello world");
  await expect.soft(component.getByTestId("textarea")).toBeFocused();
  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveSelectedText({ start: 19, end: 21 });
});

test("add one decorator", async ({ mount, page, helpers }) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await component.getByTestId("textarea").click();
  await page.keyboard.type("hello world");
  await helpers.setSelectionRange(component, 18, 20);
  component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="non-blocking"]'))
    .click();

  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveValue("**praise (non-blocking):** hello world");
  await expect.soft(component.getByTestId("textarea")).toBeFocused();
  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveSelectedText({ start: 33, end: 35 });
});

test("add two decorators", async ({ mount, page, helpers }) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await component.getByTestId("textarea").click();
  await page.keyboard.type("hello world");
  await helpers.setSelectionRange(component, 18, 20);
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="non-blocking"]'))
    .click();
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="if-minor"]'))
    .click();

  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveValue("**praise (non-blocking, if-minor):** hello world");
  await expect.soft(component.getByTestId("textarea")).toBeFocused();
  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveSelectedText({ start: 43, end: 45 });
});

test("add two decorators and remove one", async ({ mount, page, helpers }) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await component.getByTestId("textarea").click();
  await page.keyboard.type("hello world");
  await helpers.setSelectionRange(component, 18, 20);
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="non-blocking"]'))
    .click();
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="if-minor"]'))
    .click();
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="non-blocking"]'))
    .click();

  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveValue("**praise (if-minor):** hello world");
  await expect.soft(component.getByTestId("textarea")).toBeFocused();
  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveSelectedText({ start: 29, end: 31 });
});

test("add two decorators and remove one via the clear button", async ({
  mount,
  page,
  helpers,
}) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await component.getByTestId("textarea").click();
  await page.keyboard.type("hello world");
  await helpers.setSelectionRange(component, 18, 20);
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="non-blocking"]'))
    .click();
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="if-minor"]'))
    .click();
  await component
    .getByTestId("combobox-badge")
    .and(component.locator('[data-testvalue="non-blocking"]'))
    .getByTestId("combobox-badge-clear")
    .click();

  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveValue("**praise (if-minor):** hello world");
  await expect.soft(component.getByTestId("textarea")).toBeFocused();
  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveSelectedText({ start: 29, end: 31 });
});

test("remove all decorators", async ({ mount, page, helpers }) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await component.getByTestId("textarea").click();
  await page.keyboard.type("hello world");
  await helpers.setSelectionRange(component, 18, 20);
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="non-blocking"]'))
    .click();
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="if-minor"]'))
    .click();
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="non-blocking"]'))
    .click();
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="if-minor"]'))
    .click();

  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveValue("**praise:** hello world");
  await expect.soft(component.getByTestId("textarea")).toBeFocused();
  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveSelectedText({ start: 18, end: 20 });
});

test("remove label", async ({ mount, page, helpers }) => {
  const component = await mount(
    <WrappedApp isMainComment defaultTextareaValue="" />,
  );
  await component.getByTestId("textarea").click();
  await page.keyboard.type("hello world");
  await helpers.setSelectionRange(component, 18, 20);
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="non-blocking"]'))
    .click();
  await component
    .getByTestId("decorations-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="if-minor"]'))
    .click();
  await component
    .getByTestId("label-combobox")
    .getByTestId("combobox-toggle")
    .click();
  await component
    .getByTestId("combobox-item")
    .and(component.locator('[data-testvalue="none"]'))
    .click();

  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveValue("hello world");
  await expect.soft(component.getByTestId("textarea")).toBeFocused();
  await expect
    .soft(component.getByTestId("textarea"))
    .toHaveSelectedText({ start: 6, end: 8 });
});
