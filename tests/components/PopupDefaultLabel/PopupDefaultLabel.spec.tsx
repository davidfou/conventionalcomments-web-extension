import { test, expect } from "../fixtures";
import { WrappedPopupDefaultLabel } from "./PopupDefaultLabel.story.tsx";

test("disables the select while loading", async ({ mount }) => {
  const component = await mount(
    <WrappedPopupDefaultLabel label="praise" status="loading" error={null} />,
  );

  await expect(component.getByLabel("Default label")).toBeDisabled();
});

test("shows the current label", async ({ mount }) => {
  const component = await mount(
    <WrappedPopupDefaultLabel label="question" status="loaded" error={null} />,
  );

  await expect(component.getByLabel("Default label")).toBeEnabled();
  await expect(component.getByLabel("Default label")).toHaveValue("question");
});

test("calls onChange with the selected label", async ({ mount }) => {
  const component = await mount(
    <WrappedPopupDefaultLabel label="praise" status="loaded" error={null} />,
  );

  await component.getByLabel("Default label").selectOption("todo");

  await expect(component.getByTestId("changes")).toHaveText("todo");
});

test("keeps the select usable when there is an error", async ({ mount }) => {
  const component = await mount(
    <WrappedPopupDefaultLabel
      label="praise"
      status="loaded"
      error="Something went wrong"
    />,
  );

  await expect(component.getByText("Something went wrong")).toBeVisible();
  await expect(component.getByLabel("Default label")).toBeEnabled();
});
