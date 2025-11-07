import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import PopupDomains from "~/components/custom/PopupDomains";

const meta = {
  title: "Custom/PopupDomains",
  component: PopupDomains,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {},
} satisfies Meta<typeof PopupDomains>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    domainState: { status: "loading" },
    onAction: fn(),
  },
};

export const LoadedWithDomains: Story = {
  args: {
    domainState: {
      status: "loaded",
      domains: [
        { isAdded: true, url: "htts://github.com/*", isUpdating: false },
        { isAdded: true, url: "htts://gitlab.com/*", isUpdating: false },
      ],
      newDomainResult: null,
    },
    onAction: fn(),
  },
};

export const LoadedWithDomainsAndNewOne: Story = {
  args: {
    domainState: {
      status: "loaded",
      domains: [
        { isAdded: true, url: "htts://github.com/*", isUpdating: false },
        { isAdded: true, url: "htts://gitlab.com/*", isUpdating: false },
        { isAdded: false, url: "htts://mygithub.com/*", isUpdating: false },
      ],
      newDomainResult: null,
    },
    onAction: fn(),
  },
};

export const LoadedWithDomainsAndAddingNewOne: Story = {
  args: {
    domainState: {
      status: "loaded",
      domains: [
        { isAdded: true, url: "htts://github.com/*", isUpdating: false },
        { isAdded: true, url: "htts://gitlab.com/*", isUpdating: false },
        { isAdded: false, url: "htts://mygithub.com/*", isUpdating: true },
      ],
      newDomainResult: null,
    },
    onAction: fn(),
  },
};

export const LoadedWithDomainsAndAddedOne: Story = {
  args: {
    domainState: {
      status: "loaded",
      domains: [
        { isAdded: true, url: "htts://github.com/*", isUpdating: false },
        { isAdded: true, url: "htts://gitlab.com/*", isUpdating: false },
        { isAdded: true, url: "htts://mygithub.com/*", isUpdating: false },
      ],
      newDomainResult: {
        isSuccess: true,
        newDomain: {
          isAdded: true,
          url: "htts://mygithub.com/*",
          isUpdating: false,
        },
      },
    },
    onAction: fn(),
  },
};

export const LoadedWithDomainsAndAddedError: Story = {
  args: {
    domainState: {
      status: "loaded",
      domains: [
        { isAdded: true, url: "htts://github.com/*", isUpdating: false },
        { isAdded: true, url: "htts://gitlab.com/*", isUpdating: false },
        { isAdded: false, url: "htts://mygithub.com/*", isUpdating: false },
      ],
      newDomainResult: {
        isSuccess: false,
        newDomain: {
          isAdded: true,
          url: "htts://mygithub.com/*",
          isUpdating: false,
        },
      },
    },
    onAction: fn(),
  },
};

export const LoadedWithDomainsAndRemoving: Story = {
  args: {
    domainState: {
      status: "loaded",
      domains: [
        { isAdded: true, url: "htts://github.com/*", isUpdating: false },
        { isAdded: true, url: "htts://gitlab.com/*", isUpdating: false },
        { isAdded: true, url: "htts://mygithub.com/*", isUpdating: true },
      ],
      newDomainResult: null,
    },
    onAction: fn(),
  },
};

export const LoadedWithDomainsAndRemoved: Story = {
  args: {
    domainState: {
      status: "loaded",
      domains: [
        { isAdded: true, url: "htts://github.com/*", isUpdating: false },
        { isAdded: true, url: "htts://gitlab.com/*", isUpdating: false },
        { isAdded: false, url: "htts://mygithub.com/*", isUpdating: false },
      ],
      newDomainResult: {
        isSuccess: true,
        newDomain: {
          isAdded: false,
          url: "htts://mygithub.com/*",
          isUpdating: false,
        },
      },
    },
    onAction: fn(),
  },
};

export const LoadedWithDomainsAndRemovedError: Story = {
  args: {
    domainState: {
      status: "loaded",
      domains: [
        { isAdded: true, url: "htts://github.com/*", isUpdating: false },
        { isAdded: true, url: "htts://gitlab.com/*", isUpdating: false },
        { isAdded: true, url: "htts://mygithub.com/*", isUpdating: false },
      ],
      newDomainResult: {
        isSuccess: false,
        newDomain: {
          isAdded: false,
          url: "htts://mygithub.com/*",
          isUpdating: false,
        },
      },
    },
    onAction: fn(),
  },
};

export const LoadedWithoutDomains: Story = {
  args: {
    domainState: {
      status: "loaded",
      domains: [],
      newDomainResult: null,
    },
    onAction: fn(),
  },
};

export const Error: Story = {
  args: {
    domainState: {
      status: "error",
      error: "Something unexpected happened while loading",
    },
    onAction: fn(),
  },
};
