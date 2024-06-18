import { test, expect } from "@playwright/experimental-ct-react";

import WrappedApp from "./__fixtures__/WrappedApp";

test.use({ viewport: { width: 500, height: 500 } });

test("Initialization when the textarea is empty and it's the main comment", async ({
  mount,
}) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={true} />,
  );
  await expect(component.getByTestId("editor")).toHaveAttribute(
    "data-testlabel",
    "praise",
  );
  await expect(component.getByTestId("textarea")).toHaveValue("**praise:** ");
});

test("Initialization when the textarea is empty and it's not the main comment", async ({
  mount,
}) => {
  const component = await mount(
    <WrappedApp initialContent="" isMainComment={false} />,
  );
  await expect(component.getByTestId("editor")).toHaveAttribute(
    "data-testlabel",
    "deactivate",
  );
  await expect(component.getByTestId("textarea")).toHaveValue("");
});

test("Initialization when the textarea has random text and it's the main comment", async ({
  mount,
}) => {
  const component = await mount(
    <WrappedApp initialContent="Hello world!" isMainComment={true} />,
  );
  await expect(component.getByTestId("editor")).toHaveAttribute(
    "data-testlabel",
    "deactivate",
  );
  await expect(component.getByTestId("textarea")).toHaveValue("Hello world!");
});

test("Initialization when the textarea has random text and it's not the main comment", async ({
  mount,
}) => {
  const component = await mount(
    <WrappedApp initialContent="Hello world!" isMainComment={false} />,
  );
  await expect(component.getByTestId("editor")).toHaveAttribute(
    "data-testlabel",
    "deactivate",
  );
  await expect(component.getByTestId("textarea")).toHaveValue("Hello world!");
});

test("Initialization when the textarea has conventional text and it's the main comment", async ({
  mount,
}) => {
  const component = await mount(
    <WrappedApp
      initialContent="**issue (if-minor):** check it out"
      isMainComment={true}
    />,
  );
  await expect(component.getByTestId("textarea")).toHaveValue(
    "**issue (if-minor):** check it out",
  );
  await expect(component.getByTestId("editor")).toHaveAttribute(
    "data-testlabel",
    "issue",
  );
  await expect(component.getByTestId("editor")).toHaveAttribute(
    "data-testdecorations",
    "if-minor",
  );
});

test("Initialization when the textarea has conventional text and it's not the main comment", async ({
  mount,
}) => {
  const component = await mount(
    <WrappedApp
      initialContent="**issue (if-minor):** check it out"
      isMainComment={false}
    />,
  );
  await expect(component.getByTestId("textarea")).toHaveValue(
    "**issue (if-minor):** check it out",
  );
  await expect(component.getByTestId("editor")).toHaveAttribute(
    "data-testlabel",
    "issue",
  );
  await expect(component.getByTestId("editor")).toHaveAttribute(
    "data-testdecorations",
    "if-minor",
  );
});
