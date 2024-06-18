import { test as base, expect } from "@playwright/experimental-ct-react";
import PluginPage from "../PluginPage";

type MyFixtures = {
  pluginPage: PluginPage;
};
const test = base.extend<MyFixtures>({
  pluginPage: async ({ page }, use) => {
    const pluginPage = new PluginPage(page);
    await use(pluginPage);
  },
});
export { test, expect };
