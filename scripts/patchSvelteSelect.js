const assert = require("assert");
const fs = require("fs");
const path = require("path");
const package = require("svelte-select/package.json");

assert.strictEqual(
  package.version,
  "4.2.5",
  "Double check if the patch is still needed (https://github.com/rob-balfre/svelte-select/pull/277)"
);

if (package.types !== undefined) {
  return;
}

package.types = "./src/index.d.ts";
fs.writeFileSync(
  path.join(__dirname, "../node_modules/svelte-select/package.json"),
  JSON.stringify(package, null, 2)
);
