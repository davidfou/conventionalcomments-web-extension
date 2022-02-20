const { deferConfig } = require("config/defer");

module.exports = {
  codeceptjs: {
    product: "gitlab",
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
      themes: [
        "light",
        "light_high_contrast",
        "light_colorblind",
        "dark",
        "dark_high_contrast",
        "dark_colorblind",
        "dark_dimmed",
      ],
    },
  },
};
