import * as React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";

import ConfigureDomains from "./ConfigureDomains";

export default {
  title: "Components/ConfigureDomains",
  component: ConfigureDomains,
} as ComponentMeta<typeof ConfigureDomains>;

const Template: ComponentStory<typeof ConfigureDomains> =
  function TemplateComponent(args) {
    return <ConfigureDomains {...args} />;
  };

export const WithTwoDomains = Template.bind({});
WithTwoDomains.args = {
  urls: [
    {
      url: "https://gitlab.com/*",
      status: "registered",
    },
    {
      url: "https://github.com/*",
      status: "registered",
    },
  ],
};

export const WhenRemovingDomain = Template.bind({});
WhenRemovingDomain.args = {
  urls: [
    {
      url: "https://gitlab.com/*",
      status: "registered",
    },
    {
      url: "https://github.com/*",
      status: "registered",
    },
    {
      url: "https://custom.git.com/*",
      status: "isRemoving",
    },
  ],
  isLoading: false,
};

export const WithNewDomain = Template.bind({});
WithNewDomain.args = {
  urls: [
    {
      url: "https://gitlab.com/*",
      status: "registered",
    },
    {
      url: "https://github.com/*",
      status: "registered",
    },
    {
      url: "https://custom.git.com/*",
      status: "new",
    },
  ],
  isLoading: false,
};

export const WhenAddingDomain = Template.bind({});
WhenAddingDomain.args = {
  urls: [
    {
      url: "https://gitlab.com/*",
      status: "registered",
    },
    {
      url: "https://github.com/*",
      status: "registered",
    },
    {
      url: "https://custom.git.com/*",
      status: "isAdding",
    },
  ],
  isLoading: false,
};

export const WhenEmpty = Template.bind({});
WhenEmpty.args = { urls: [], isLoading: false };

export const WhenEmptyAndNewDomain = Template.bind({});
WhenEmptyAndNewDomain.args = {
  urls: [
    {
      url: "https://custom.git.com/*",
      status: "new",
    },
  ],
  isLoading: false,
};

export const WhenLoading = Template.bind({});
WhenLoading.args = {
  urls: [],
  isLoading: true,
};
