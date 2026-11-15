import { storage } from "#imports";
import { browser } from "wxt/browser";

const DEFAULT_URLS = ["https://github.com/*", "https://gitlab.com/*"] as const;

export default {
  key: "addConfiguredUrls",
  run: async (): Promise<void> => {
    const [permissions, registrations, deactivatedUrls] = await Promise.all([
      browser.permissions.getAll(),
      browser.scripting.getRegisteredContentScripts(),
      storage.getItem<string[]>("local:deactivatedUrls"),
    ]);

    const urls = new Set<string>(DEFAULT_URLS);
    for (const url of permissions.origins ?? []) {
      urls.add(url);
    }
    for (const registration of registrations) {
      for (const url of registration.matches ?? []) {
        urls.add(url);
      }
    }
    for (const url of deactivatedUrls ?? []) {
      urls.delete(url);
    }

    await storage.setItem("local:configuredUrls", [...urls]);
    await storage.removeItem("local:deactivatedUrls");
  },
};
