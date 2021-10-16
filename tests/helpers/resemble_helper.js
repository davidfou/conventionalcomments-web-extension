const ResembleHelper = require("codeceptjs-resemblehelper");
const path = require("path");
const get = require("lodash.get");
const Container = require("codeceptjs/lib/container");

/* eslint-disable no-underscore-dangle, class-methods-use-this */
class PatchedResembleHelper extends ResembleHelper {
  _resolveImagePathRelativeFromReport(folderPath) {
    let absolutePathOfImage = folderPath;
    if (!path.isAbsolute(absolutePathOfImage)) {
      absolutePathOfImage = `${path.resolve(
        global.codecept_dir,
        absolutePathOfImage
      )}/`;
    }
    let absolutePathOfReportFolder = global.output_dir;
    const mocha = Container.mocha();
    // support mocha
    if (
      get(mocha, "options.reporterOptions.reportDir", undefined) !== undefined
    ) {
      absolutePathOfReportFolder = mocha.options.reporterOptions.reportDir;
    }
    // support mocha-multi-reporters
    if (
      get(
        mocha,
        "options.reporterOptions.mochawesomeReporterOptions.reportDir",
        undefined
      ) !== undefined
    ) {
      absolutePathOfReportFolder =
        mocha.options.reporterOptions.mochawesomeReporterOptions.reportDir;
    }
    return path.relative(absolutePathOfReportFolder, absolutePathOfImage);
  }

  async _addMochaContext(baseImage, misMatch, options) {
    const mocha = this.helpers.Mochawesome;

    if (mocha !== undefined && misMatch >= options.tolerance) {
      await mocha.addMochawesomeContext("Base Image");
      await mocha.addMochawesomeContext(
        this._resolveImagePathRelativeFromReport(
          this._getBaseImagePath(baseImage, options)
        )
      );
      await mocha.addMochawesomeContext("ScreenShot Image");
      await mocha.addMochawesomeContext(
        this._resolveImagePathRelativeFromReport(
          this._getActualImagePath(baseImage)
        )
      );
      await mocha.addMochawesomeContext("Diff Image");
      await mocha.addMochawesomeContext(
        this._resolveImagePathRelativeFromReport(
          this._getDiffImagePath(baseImage)
        )
      );
    }
  }
}

module.exports = PatchedResembleHelper;
