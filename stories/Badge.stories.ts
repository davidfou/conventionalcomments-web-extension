import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import Badge from "~/components/custom/Badge";

const meta = {
  title: "Custom/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    action: {
      options: [undefined, "add", "remove"],
      control: { type: "radio" },
    },
  },
  args: {},
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryAdd: Story = {
  args: {
    variant: "primary",
    action: "add",
    onAction: fn(),
    disabled: false,
    children: "Badge",
  },
};

export const PrimaryRemove: Story = {
  args: {
    variant: "primary",
    action: "remove",
    onAction: fn(),
    disabled: false,
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    action: undefined,
    children: "Badge",
  },
};

export const Loading: Story = {
  args: {
    variant: "loading",
    action: undefined,
    children: "Badge",
  },
};
