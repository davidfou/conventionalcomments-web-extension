const { setHeadlessWhen } = require("@codeceptjs/configure");
const config = require("config");
const merge = require("lodash.merge");

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

const configs = {
  gitlab: {
    helpers: {
      Gitlab: {
        require: "./tests/helpers/gitlab_helper.js",
      },
    },
    include: {
      MainPage: "./tests/pages/Gitlab.js",
    },
  },
};

const product = config.get("codeceptjs.product");
const availableProducts = Object.keys(configs);
if (!availableProducts.includes(product)) {
  throw new Error(
    `Expect product to be ${availableProducts.join("|")}, got \`${product}\``
  );
}

exports.config = merge(
  {
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
      customLocator: {
        enabled: true,
        attribute: "data-qa",
      },
      tryTo: {
        enabled: true,
      },
    },
  },
  configs[product]
);
