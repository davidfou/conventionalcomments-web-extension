import getSelectableItemByValue from "./getSelectableItemByValue";

const selectableItems = [
  {
    value: "value1",
    label: "label1",
    description: "description1",
  },
  {
    value: "value2",
    label: "label2",
    description: "description2",
  },
  {
    value: "value3",
    label: "label3",
    description: "description3",
  },
];

it.each`
  value       | expectedItem
  ${"value1"} | ${selectableItems[0]}
  ${"value2"} | ${selectableItems[1]}
  ${"value3"} | ${selectableItems[2]}
`("returns expected item when value is $value", ({ value, expectedItem }) => {
  expect(getSelectableItemByValue(value, selectableItems)).toBe(expectedItem);
});

it("raises an error when the item is not found", () => {
  expect(() => {
    getSelectableItemByValue("value4", selectableItems);
  }).toThrow("Item with value 'value4' is not present.");
});
