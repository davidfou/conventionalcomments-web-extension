import * as React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";

import Layout from "./Layout";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Components/Layout",
  component: Layout,
} as ComponentMeta<typeof Layout>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Layout> = function TemplateComponent(
  args
) {
  return <Layout {...args} />;
};

export const Normal = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Normal.args = {
  children: <div>Main content</div>,
};
