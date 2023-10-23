module.exports = {
  codeceptjs: {
    product: undefined,
    gitlab: {
      project: "web-ext-test-ci-v2",
    },
    github: {
      project: "web-ext-test-ci-v2",
    },
  },
  playwright: {
    reporter: [["html", { open: "never" }], ["github"]],
  },
};
