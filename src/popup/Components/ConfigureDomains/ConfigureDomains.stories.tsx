import * as React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";

import ConfigureDomains from "./ConfigureDomains";
import AnnouncementContext from "../../AnnouncementContext";

export default {
  title: "Components/ConfigureDomains",
  component: ConfigureDomains,
} as ComponentMeta<typeof ConfigureDomains>;

const context = {
  isLoading: false,
  announcements: ["custom-domains"],
  onRemoveAnnouncement: () => {},
};
const Template: ComponentStory<typeof ConfigureDomains> =
  function TemplateComponent(args) {
    return (
      <AnnouncementContext.Provider value={context}>
        <ConfigureDomains {...args} />
      </AnnouncementContext.Provider>
    );
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

export const WhenRemovingDomainSuccess = Template.bind({});
WhenRemovingDomainSuccess.args = {
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
      status: "removed",
      report: {
        status: "success",
        action: "remove",
        isOpen: true,
      },
    },
  ],
  isLoading: false,
};

export const WhenRemovingDomainFailure = Template.bind({});
WhenRemovingDomainFailure.args = {
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
      status: "registered",
      report: {
        status: "error",
        action: "remove",
        isOpen: true,
        message: "Something went wrong!",
      },
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

export const WhenAddingDomainSuccess = Template.bind({});
WhenAddingDomainSuccess.args = {
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
      status: "registered",
      report: {
        status: "success",
        action: "add",
        isOpen: true,
      },
    },
  ],
  isLoading: false,
};

export const WhenAddingDomainFailure = Template.bind({});
WhenAddingDomainFailure.args = {
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
      report: {
        status: "error",
        action: "add",
        isOpen: true,
        message: "Something went wrong",
      },
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
