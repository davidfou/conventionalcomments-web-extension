const { deferConfig } = require("config/defer");

module.exports = {
  e2e: {
    gitlab: {
      username: undefined,
      password: undefined,
      project: undefined,
      token: undefined,
      twoFactorSecret: undefined,
      baseUrl: "https://gitlab.com",
      mainPage: deferConfig(function mainPage() {
        return [
          "",
          this.e2e.gitlab.username,
          this.e2e.gitlab.project,
          "-/merge_requests/1/diffs",
        ].join("/");
      }),
      overviewPage: deferConfig(function mainPage() {
        return [
          "",
          this.e2e.gitlab.username,
          this.e2e.gitlab.project,
          "-/merge_requests/1",
        ].join("/");
      }),
      editPullRequestPage: deferConfig(function editPullRequestPage() {
        return [
          "",
          this.e2e.gitlab.username,
          this.e2e.gitlab.project,
          "-/merge_requests/1/edit",
        ].join("/");
      }),
      newPullRequestPage: deferConfig(function newPullRequestPage() {
        return [
          "",
          this.e2e.gitlab.username,
          this.e2e.gitlab.project,
          "-/merge_requests/new?merge_request[source_branch]=new_branch2",
        ].join("/");
      }),
      newIssuePage: deferConfig(function newIssuePage() {
        return [
          "",
          this.e2e.gitlab.username,
          this.e2e.gitlab.project,
          "-/issues/new",
        ].join("/");
      }),
      issuePage: deferConfig(function mainPage() {
        return [
          "",
          this.e2e.gitlab.username,
          this.e2e.gitlab.project,
          "-/issues/1",
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
        "Gray",
        "Light Gray",
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
          this.e2e.github.username,
          this.e2e.github.project,
          "pull/1/files",
        ].join("/");
      }),
      overviewPage: deferConfig(function overviewPage() {
        return [
          "",
          this.e2e.github.username,
          this.e2e.github.project,
          "pull/1",
        ].join("/");
      }),
      newPullRequestPage: deferConfig(function newPullRequestPage() {
        return [
          "",
          this.e2e.github.username,
          this.e2e.github.project,
          "compare/new_branch2?expand=1",
        ].join("/");
      }),
      newIssuePage: deferConfig(function newIssuePage() {
        return [
          "",
          this.e2e.github.username,
          this.e2e.github.project,
          "issues/new",
        ].join("/");
      }),
      issuePage: deferConfig(function newIssuePage() {
        return [
          "",
          this.e2e.github.username,
          this.e2e.github.project,
          "issues/2",
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
    version: "v3",
    fileKey: "F5u9sP9QoNqEMpgJzQKzN1",
  },
  playwright: {
    reporter: "html",
    googleBin: "google-chrome",
    debugGitLabGetCookies: false,
    skipGitLabLogin: false,
  },
};
