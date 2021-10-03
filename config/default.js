const { deferConfig } = require("config/defer");

module.exports = {
  codeceptjs: {
    product: "gitlab",
    headless: false,
    updateScreenshots: false,
    shouldUpdateScreenshotOwner: false,
    gitlab: {
      username: undefined,
      password: undefined,
      project: undefined,
      token: undefined,
      baseUrl: "https://gitlab.com",
      mainPage: deferConfig(function mainPage() {
        return [
          "",
          this.codeceptjs.gitlab.username,
          this.codeceptjs.gitlab.project,
          "-/merge_requests/1/diffs",
        ].join("/");
      }),
      overviewPage: deferConfig(function mainPage() {
        return [
          "",
          this.codeceptjs.gitlab.username,
          this.codeceptjs.gitlab.project,
          "-/merge_requests/1",
        ].join("/");
      }),
    },
    github: {
      username: undefined,
      password: undefined,
      project: undefined,
      token: undefined,
      twoFactorSecret: undefined,
      baseUrl: "https://github.com",
      mainPage: deferConfig(function mainPage() {
        return [
          "",
          this.codeceptjs.github.username,
          this.codeceptjs.github.project,
          "pull/1/files",
        ].join("/");
      }),
      overviewPage: deferConfig(function overviewPage() {
        return [
          "",
          this.codeceptjs.github.username,
          this.codeceptjs.github.project,
          "pull/1",
        ].join("/");
      }),
    },
  },
  userId: undefined,
  groupId: undefined,
};
