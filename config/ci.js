module.exports = {
  e2e: {
    product: undefined,
    gitlab: {
      project: "web-ext-test-ci-v3",
    },
    github: {
      project: "web-ext-test-ci-v3",
    },
  },
  playwright: {
    reporter: [["html", { open: "never" }], ["github"]],
    skipGitLabLogin: true,
  },
};
