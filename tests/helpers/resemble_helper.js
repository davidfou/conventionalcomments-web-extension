const ResembleHelper = require("codeceptjs-resemblehelper");
const path = require("path");
const Container = require("codeceptjs/lib/container");

/* eslint-disable no-underscore-dangle, class-methods-use-this */
class PatchedResembleHelper extends ResembleHelper {
  _resolveRelativePath(folderPath) {
    let absolutePathOfImage = folderPath;
    if (!path.isAbsolute(absolutePathOfImage)) {
      absolutePathOfImage = `${path.resolve(
        global.codecept_dir,
        absolutePathOfImage
      )}/`;
    }
    let absolutePathOfReportFolder = global.output_dir;
    // support mocha-multi-reporters
    if (
      Container.mocha() &&
      typeof Container.mocha().options.reporterOptions?.mochawesome?.options
        ?.reportDir !== "undefined"
    ) {
      absolutePathOfReportFolder =
        Container.mocha().options.reporterOptions.mochawesome.options.reportDir;
    }
    return path.relative(absolutePathOfReportFolder, absolutePathOfImage);
  }

  resolveImagePathRelativeFromReport(...args) {
    return this._resolveRelativePath(...args);
  }
}

module.exports = PatchedResembleHelper;
