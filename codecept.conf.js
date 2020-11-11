const { setHeadlessWhen } = require("@codeceptjs/configure");
const config = require("config");

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  tests: "./tests/*_test.js",
  output: "./output",
  helpers: {
    Playwright: {
      require: "./tests/helpers/custom_playwright_helper.js",
      show: config.get("codeceptjs.headless"),
      browser: "firefox",
      waitForNavigation: "load",
      keepCookies: true,
      waitForTimeout: 5000,
    },
    Test: {
      require: "./tests/helpers/test_helper.js",
    },
    Gitlab: {
      require: "./tests/helpers/gitlab_helper.js",
    },
  },
  include: {
    GitlabPage: "./tests/pages/Gitlab.js",
  },
  mocha: {},
  name: "conventionalcomments-web-ext",
  plugins: {
    retryFailedStep: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
    autoLogin: {
      enabled: true,
      users: {
        gitlab: {
          login: () => {
            const { GitlabPage } = inject();
            GitlabPage.login();
          },
          check: () => {},
        },
      },
    },
    customLocator: {
      enabled: true,
      attribute: "data-qa",
    },
    tryTo: {
      enabled: true,
    },
  },
};
