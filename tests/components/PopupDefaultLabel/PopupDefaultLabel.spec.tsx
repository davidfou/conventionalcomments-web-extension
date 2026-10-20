import { test, expect } from "../fixtures";
import { WrappedPopupDefaultLabel } from "./PopupDefaultLabel.story.tsx";

test("disables the select with a loading placeholder while loading", async ({
  mount,
}) => {
  const component = await mount(<WrappedPopupDefaultLabel status="loading" />);

  const select = component.getByTestId("default-label-select");

  await expect(select).toBeDisabled();
  await expect(select).toHaveText("Loading…");
});

test("shows the current label", async ({ mount }) => {
  const component = await mount(
    <WrappedPopupDefaultLabel status="loaded" label="question" />,
  );

  const select = component.getByTestId("default-label-select");

  await expect(select).toBeEnabled();
  await expect(select).toHaveValue("question");
  await expect(component.getByTestId("default-label-error")).toHaveCount(0);
});

test("calls onChange with the selected label", async ({ mount }) => {
  const component = await mount(
    <WrappedPopupDefaultLabel status="loaded" label="praise" />,
  );

  await component.getByTestId("default-label-select").selectOption("todo");

  await expect(component.getByTestId("changes")).toHaveText("todo");
});

test("keeps the select usable when saving failed", async ({ mount }) => {
  const component = await mount(
    <WrappedPopupDefaultLabel
      status="saveError"
      label="praise"
      error="Something went wrong"
    />,
  );

  await expect(component.getByTestId("default-label-error")).toHaveText(
    "Something went wrong",
  );
  const select = component.getByTestId("default-label-select");

  await expect(select).toBeEnabled();
  await expect(select).toHaveAccessibleDescription(
    "Label preselected when starting a new comment. Something went wrong",
  );
});

test("keeps the select usable when loading failed", async ({ mount }) => {
  const component = await mount(
    <WrappedPopupDefaultLabel status="error" error="Something went wrong" />,
  );

  await expect(component.getByTestId("default-label-error")).toHaveText(
    "Something went wrong",
  );
  const select = component.getByTestId("default-label-select");

  await expect(select).toBeEnabled();
  await expect(select).toHaveValue("");

  await select.selectOption("todo");

  await expect(component.getByTestId("changes")).toHaveText("todo");
});
