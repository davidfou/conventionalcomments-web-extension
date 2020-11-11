const fs = require("fs");
const path = require("path");
const manifest = require("../public/manifest.json");

manifest.version = process.env.npm_package_version;

fs.writeFileSync(
  path.join(__dirname, "../public/manifest.json"),
  JSON.stringify(manifest, null, 2)
);
