const { deferConfig } = require("config/defer");

module.exports = {
  codeceptjs: {
    product: "gitlab",
    screenshotNames: [
      "editor-active",
      "editor-inactive",
      "label-selector",
      "label-selector-mouse-hover",
      "decorator-selector-mouse-hover-clear",
    ],
    updateScreenshots: false,
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
      newPullRequestPage: deferConfig(function newPullRequestPage() {
        return [
          "",
          this.codeceptjs.gitlab.username,
          this.codeceptjs.gitlab.project,
          "-/merge_requests/new?merge_request[source_branch]=new_branch2",
        ].join("/");
      }),
      newIssuePage: deferConfig(function newIssuePage() {
        return [
          "",
          this.codeceptjs.gitlab.username,
          this.codeceptjs.gitlab.project,
          "-/issues/new",
        ].join("/");
      }),
      themes: [
        "Indigo",
        "Light Indigo",
        "Blue",
        "Light Blue",
        "Green",
        "Light Green",
        "Red",
        "Light Red",
        "Dark",
        "Light",
        "Dark Mode (alpha)",
      ],
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
      newPullRequestPage: deferConfig(function newPullRequestPage() {
        return [
          "",
          this.codeceptjs.github.username,
          this.codeceptjs.github.project,
          "compare/new_branch2?expand=1",
        ].join("/");
      }),
      newIssuePage: deferConfig(function newIssuePage() {
        return [
          "",
          this.codeceptjs.github.username,
          this.codeceptjs.github.project,
          "issues/new",
        ].join("/");
      }),
      themes: [
        "light",
        "light_high_contrast",
        "light_colorblind",
        "light_tritanopia",
        "dark",
        "dark_high_contrast",
        "dark_colorblind",
        "dark_tritanopia",
        "dark_dimmed",
      ],
    },
  },
  figma: {
    token: undefined,
    version: "v2",
    fileKey: "F5u9sP9QoNqEMpgJzQKzN1",
  },
};
