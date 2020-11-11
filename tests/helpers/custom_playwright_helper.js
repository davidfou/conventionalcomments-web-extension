const config = require("config");
const Playwright = require("codeceptjs/lib/helper/Playwright");
const playwright = require("playwright");
const webExt = require("web-ext");
const path = require("path");

/* eslint-disable no-underscore-dangle */
class CustomPlaywright extends Playwright {
  async _startBrowser() {
    if (this.extensionRunner === undefined) {
      webExt.util.logger.consoleStream.makeVerbose();
      webExt.util.logger.consoleStream.startCapturing();
      const args = ["-juggler=1234"];
      if (config.get("codeceptjs.headless")) {
        args.push("--headless");
      }
      this.extensionRunner = await webExt.cmd.run({
        sourceDir: path.join(__dirname, "../../public"),
        firefox: playwright.firefox.executablePath(),
        args,
      });
      const JUGGLER_MESSAGE = `Juggler listening on`;
      const message = webExt.util.logger.consoleStream.capturedMessages.find(
        (msg) => msg.includes(JUGGLER_MESSAGE)
      );

      this.playwrightOptions.wsEndpoint = message.split(JUGGLER_MESSAGE).pop();
    }

    this.isRemoteBrowser = true;
    await super._startBrowser();
    this.isRemoteBrowser = false;
  }

  async _stopBrowser() {
    await super._stopBrowser();

    if (this.extensionRunner !== undefined) {
      await this.extensionRunner.exit();
      delete this.extensionRunner;
    }
  }
}

module.exports = CustomPlaywright;
