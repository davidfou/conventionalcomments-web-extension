export const VALID_CONVENTION = {
  version: 1,
  labels: [
    {
      label: "spotted",
      description: "Something noticed during review.",
    },
    {
      label: "approved",
      description: "Reviewer-approved change.",
    },
  ],
  decorations: [
    {
      label: "blocker",
      description: "Must be addressed before merging.",
    },
  ],
  defaultLabel: "spotted",
};

export const INVALID_CONVENTION = {
  version: 1,
  labels: [],
  decorations: [],
};

export const CONVENTION_FILE_PATH = ".conventional-comments.json";
