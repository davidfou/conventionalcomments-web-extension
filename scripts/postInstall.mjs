import assert from "assert";
import GetGoogleFonts from "get-google-fonts";
import { createRequire } from "module";

const getGoogleFonts = new GetGoogleFonts({ outputDir: "./public/fonts" });
await getGoogleFonts.download([{ Roboto: ["300", "400", "500", "700"] }]);

const require = createRequire(import.meta.url);
const { version } = require("codeceptjs-resemblehelper/package.json");

assert.strictEqual(
  version,
  "1.9.5",
  "Double check if custom ResembleHelper is still necessary (https://github.com/codeceptjs/codeceptjs-resemblehelper/pull/97)"
);
