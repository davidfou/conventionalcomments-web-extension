import type { Meta, StoryObj } from "@storybook/react-vite";

import PopupLayout from "~/components/custom/PopupLayout";

const meta = {
  title: "Custom/PopupLayout",
  component: PopupLayout,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {},
} satisfies Meta<typeof PopupLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Content",
  },
};
