const { deferConfig } = require("config/defer");

module.exports = {
  codeceptjs: {
    product: "gitlab",
    headless: false,
    gitlab: {
      username: undefined,
      password: undefined,
      project: undefined,
      token: undefined,
      mainPage: deferConfig(function mainPage() {
        return [
          "https://gitlab.com",
          this.codeceptjs.gitlab.username,
          this.codeceptjs.gitlab.project,
          "-/merge_requests/1/diffs",
        ].join("/");
      }),
      overviewPage: deferConfig(function mainPage() {
        return [
          "https://gitlab.com",
          this.codeceptjs.gitlab.username,
          this.codeceptjs.gitlab.project,
          "-/merge_requests/1",
        ].join("/");
      }),
    },
  },
};
