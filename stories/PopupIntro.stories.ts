import type { Meta, StoryObj } from "@storybook/react-vite";

import PopupIntro from "~/components/custom/PopupIntro";

const meta = {
  title: "Custom/PopupIntro",
  component: PopupIntro,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  args: {},
} satisfies Meta<typeof PopupIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
