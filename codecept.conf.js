const config = require("config");
const { event, container } = require("codeceptjs");
const merge = require("lodash.merge");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const os = require("os");

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
const pathToExtension = path.join(process.cwd(), "public");
const userDataDir = fsSync.mkdtempSync(
  path.join(os.tmpdir(), "playwright-tmp-")
);

exports.config = merge(
  {
    tests: "./tests/*_test.js",
    output: "./output/screenshots",
    helpers: {
      Playwright: {
        url: config.get(`codeceptjs.${product}.baseUrl`),
        show: true,
        waitForNavigation: "load",
        keepCookies: true,
        keepBrowserState: false,
        waitForTimeout: 5000,
        windowSize: "1440x900",
        browser: "chromium",
        chromium: {
          userDataDir,
          args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
          ],
        },
      },
      Test: {
        require: "./tests/helpers/test_helper.js",
      },
      ResembleHelper: {
        require: "./tests/helpers/resemble_helper.js",
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
        "codeceptjs-cli-reporter": {
          stdout: "-",
          options: {
            verbose: false,
            steps: true,
          },
        },
        mochawesome: {
          stdout: "./output/console-mochawesome.log",
          options: {
            reportDir: "./output",
            reportTitle: `E2E tests for ${product}`,
          },
        },
        "mocha-junit-reporter": {
          stdout: "./output/console-junit.log",
          options: {
            mochaFile: "./output/result.xml",
            attachments: true,
          },
        },
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
      if (config.get("codeceptjs.updateScreenshots")) {
        await fs.rm(path.join(__dirname, "tests/screenshots", product), {
          recursive: true,
          force: true,
        });
      }
    },
    hooks: [
      () => {
        event.dispatcher.on(event.all.after, async () => {
          container.helpers("Playwright").browser.on("close", async () => {
            fs.rm(userDataDir, {
              recursive: true,
              force: true,
              maxRetries: 5,
            });
          });
        });
      },
    ],
  },
  configs[product]
);
