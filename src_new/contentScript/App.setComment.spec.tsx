import { test, expect } from "@/tests/fixtures/component";
import { setSelectionRange } from "@/tests/helpers";

import WrappedApp from "./__fixtures__/WrappedApp";

test.use({ viewport: { width: 500, height: 500 } });

test("Another label can be selected", async ({ mount, pluginPage }) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  pluginPage.setComponent(component);
  await expect(component.getByTestId("textarea")).toBeFocused();
  await pluginPage.selectLabel("nitpick");

  await expect(component.getByTestId("textarea")).toHaveValue("**nitpick:** ");
});

test("One decoration can be added", async ({ mount, pluginPage }) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  pluginPage.setComponent(component);
  await expect(component.getByTestId("textarea")).toBeFocused();
  await pluginPage.toggleDecoration("if-minor");

  await expect(component.getByTestId("textarea")).toHaveValue(
    "**praise (if-minor):** ",
  );
});

test("Two decoration can be added", async ({ mount, pluginPage }) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  pluginPage.setComponent(component);
  await expect(component.getByTestId("textarea")).toBeFocused();
  await pluginPage.toggleDecoration("if-minor");
  await pluginPage.toggleDecoration("non-blocking");

  await expect(component.getByTestId("textarea")).toHaveValue(
    "**praise (if-minor, non-blocking):** ",
  );
});

test("One decoration can be removed", async ({ mount, pluginPage }) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  pluginPage.setComponent(component);
  await expect(component.getByTestId("textarea")).toBeFocused();
  await pluginPage.toggleDecoration("if-minor");
  await pluginPage.toggleDecoration("non-blocking");
  await pluginPage.toggleDecoration("if-minor");

  await expect(component.getByTestId("textarea")).toHaveValue(
    "**praise (non-blocking):** ",
  );
});

test("Two decoration can be removed", async ({ mount, pluginPage }) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  pluginPage.setComponent(component);
  await expect(component.getByTestId("textarea")).toBeFocused();
  await pluginPage.toggleDecoration("if-minor");
  await pluginPage.toggleDecoration("non-blocking");
  await pluginPage.toggleDecoration("non-blocking");
  await pluginPage.toggleDecoration("if-minor");

  await expect(component.getByTestId("textarea")).toHaveValue("**praise:** ");
});

test("Selecting deactivate also removes the formatted comment", async ({
  mount,
  pluginPage,
}) => {
  const component = await mount(
    <WrappedApp
      initialContent="**chore (if-minor):** do it"
      isMainComment={true}
    />,
  );
  pluginPage.setComponent(component);
  await pluginPage.selectLabel("deactivate");
  await expect(component.getByTestId("textarea")).toHaveValue("do it");
});

test("A label can be set on a message not repecting the convention", async ({
  mount,
  pluginPage,
}) => {
  const component = await mount(
    <WrappedApp initialContent="do it" isMainComment={true} />,
  );
  pluginPage.setComponent(component);
  await expect(component.getByTestId("textarea")).toBeFocused();
  await pluginPage.selectLabel("nitpick");

  await expect(component.getByTestId("textarea")).toHaveValue(
    "**nitpick:** do it",
  );
});

test("the cursor position keeps the same position within the subject", async ({
  mount,
  page,
  pluginPage,
}) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  pluginPage.setComponent(component);
  await expect(component.getByTestId("textarea")).toBeFocused();
  await page.keyboard.type("my comment");
  await setSelectionRange(page, 18, 18);

  await pluginPage.selectLabel("nitpick");

  await expect(component.getByTestId("textarea")).toBeFocused();
  await expect(component.getByTestId("textarea")).toHaveSelectedText(19, 19);

  await pluginPage.toggleDecoration("non-blocking");

  await expect(component.getByTestId("textarea")).toBeFocused();
  await expect(component.getByTestId("textarea")).toHaveSelectedText(34, 34);

  await pluginPage.toggleDecoration("non-blocking");

  await expect(component.getByTestId("textarea")).toBeFocused();
  await expect(component.getByTestId("textarea")).toHaveSelectedText(19, 19);

  await pluginPage.selectLabel("deactivate");

  await expect(component.getByTestId("textarea")).toBeFocused();
  await expect(component.getByTestId("textarea")).toHaveSelectedText(6, 6);
});
