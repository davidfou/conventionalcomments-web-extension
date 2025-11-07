import { exec } from "node:child_process";
import { promisify } from "node:util";
import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

const isCanary = process.env.IS_CANARY === "true";
async function getVersion(): Promise<string> {
  if (process.env.CI !== "true" || process.env.CI_PUBLISH !== "true") {
    return "1.0.0";
  }
  const execa = promisify(exec);
  const { stdout: latestTag } = await execa("git describe --tags --abbrev=0");
  const start = latestTag.replaceAll("v", "").trim();
  if (!isCanary) {
    return start;
  }
  const { stdout: end } = await execa(
    "git rev-list $(git describe --tags --abbrev=0)..HEAD --count",
  );
  return `${start}.${end.trim()}`;
}
const version = await getVersion();

export default defineConfig({
  imports: false,
  modules: ["@wxt-dev/module-react"],
  manifestVersion: 3,
  manifest: {
    version,
    name: `Conventional: comments${isCanary ? " (canary)" : ""}`,
    description:
      "Write conventional comments directly in your favorite repository manager.",
    permissions: ["activeTab", "storage", "scripting"],
    optional_host_permissions: ["*://*/*"],
    browser_specific_settings: {
      gecko: {
        id: process.env.FIREFOX_EXTENSION_ID,
        strict_min_version: "128.0",
      },
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
