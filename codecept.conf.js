const { setHeadlessWhen } = require("@codeceptjs/configure");
const config = require("config");
const merge = require("lodash.merge");
const fs = require("fs").promises;
const path = require("path");
const chownr = require("chownr");
const { promisify } = require("util");

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
  github: {
    helpers: {
      Github: {
        require: "./tests/helpers/github_helper.js",
      },
    },
    include: {
      MainPage: "./tests/pages/Github.js",
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
    output: `./output/screenshots`,
    helpers: {
      Playwright: {
        url: config.get(`codeceptjs.${product}.baseUrl`),
        require: "./tests/helpers/custom_playwright_helper.js",
        show: config.get("codeceptjs.headless"),
        browser: "firefox",
        waitForNavigation: "load",
        keepCookies: true,
        waitForTimeout: 5000,
        windowSize: "1440x900",
      },
      Test: {
        require: "./tests/helpers/test_helper.js",
      },
      ResembleHelper: {
        require: "codeceptjs-resemblehelper",
        screenshotFolder: "./output/screenshots/",
        baseFolder: `./tests/screenshots/${product}/`,
        diffFolder: "./output/screenshots-diff/",
        prepareBaseImage: config.get("codeceptjs.updateScreenshots"),
      },
      Mochawesome: {
        uniqueScreenshotNames: "true",
      },
    },
    mocha: {
      reporterOptions: {
        reportDir: "output/html",
      },
    },
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
    async bootstrap() {
      if (!config.get("codeceptjs.updateScreenshots")) {
        return;
      }
      await fs.rmdir(path.join(__dirname, "tests/screenshots", product), {
        recursive: true,
      });
    },
    async teardown() {
      if (
        !config.get("codeceptjs.updateScreenshots") ||
        !config.get("codeceptjs.shouldUpdateScreenshotOwner")
      ) {
        return;
      }
      await promisify(chownr)(
        "./tests/screenshots",
        config.get("userId"),
        config.get("groupId")
      );
    },
  },
  configs[product]
);
