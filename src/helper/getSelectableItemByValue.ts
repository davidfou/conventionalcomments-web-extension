import type { SelectableItem } from "../types";

const getSelectableItemByValue = (
  value: string,
  selectableItems: SelectableItem[]
): SelectableItem => {
  const selectableItem = selectableItems.find((item) => item.value === value);
  if (selectableItem === undefined) {
    throw new Error(`Item with value '${value}' is not present.`);
  }

  return selectableItem;
};

export default getSelectableItemByValue;
