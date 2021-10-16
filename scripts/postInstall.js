const assert = require("assert");
const { version } = require("codeceptjs-resemblehelper/package.json");

assert.strictEqual(
  version,
  "1.9.4",
  "Double check if custom ResembleHelper is still necessary (https://github.com/codeceptjs/codeceptjs-resemblehelper/pull/97)"
);
