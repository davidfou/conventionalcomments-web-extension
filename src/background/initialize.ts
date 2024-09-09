import runMigrations from "./runMigrations";
import { getDeactivatedUrls } from "./deactivatedUrls";
import refreshIcon from "./refreshIcon";

const initialize = async (
  registeredUrls: Map<string, string>
): Promise<void> => {
  await runMigrations();
  const [permissions, deactivatedUrls] = await Promise.all([
    chrome.permissions.getAll(),
    getDeactivatedUrls(),
    refreshIcon(),
  ]);

  await chrome.scripting.unregisterContentScripts();

  const contentScriptUrls = (permissions.origins ?? []).filter(
    (url) => !deactivatedUrls.includes(url)
  );

  await chrome.scripting.registerContentScripts(
    contentScriptUrls.map((url, index) => {
      const id = `contentScript-${index}`;
      registeredUrls.set(url, id);
      return {
        id,
        matches: [url],
        js: ["build/contentScript.js"],
        css: ["build/contentScript.css"],
      };
    })
  );
};

export default initialize;
