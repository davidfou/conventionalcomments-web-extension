import { browser, type PublicPath } from "wxt/browser";
import runMigrations from "./runMigrations";
import refreshIcon from "./refreshIcon";
import {
  addDeactivatedUrl,
  getDeactivatedUrls,
  removeDeactivatedUrl,
} from "./deactivatedUrls";
import {
  addAnnouncement,
  getActiveAnnouncements,
  markAnnoucementAsRead,
} from "./announcements";
import ApplicationError from "~/lib/ApplicationError";
import getTabIds from "./getTabIds";
import { defineBackground } from "#imports";
import { onMessage, sendMessage } from "~/lib/messaging";
import getRandomId from "~/lib/getRandomId";
import logger from "./logger";

const CONTENT_SCRIPT: PublicPath = "/content-scripts/content.js";
const CONTENT_CSS: string = "/content-scripts/content.css";

const newRegisteredUrls: Set<string> = new Set();
const registeredUrls: Map<string, string> = new Map();
let initPromise: Promise<void> | null = null;

async function registerContentScript(urls: string[]): Promise<void> {
  logger("Register %d scripts: %o", urls.length, urls);
  const contentScripts: { id: string; url: string }[] = urls.map((url) => ({
    id: getRandomId(),
    url,
  }));
  await browser.scripting.registerContentScripts(
    contentScripts.map(({ id, url }) => ({
      id,
      matches: [url],
      js: [CONTENT_SCRIPT],
      css: [CONTENT_CSS],
    })),
  );
  for (const { id, url } of contentScripts) {
    registeredUrls.set(url, id);
  }
  logger("Script registered");
}

function init(): Promise<void> {
  initPromise ??= Promise.resolve()
    .then(async () => {
      logger("Start initialization");
      await runMigrations();
      const [permissions, deactivatedUrls] = await Promise.all([
        browser.permissions.getAll(),
        getDeactivatedUrls(),
        refreshIcon(),
      ]);

      await browser.scripting.unregisterContentScripts();

      const contentScriptUrls = (permissions.origins ?? []).filter(
        (url) => !deactivatedUrls.includes(url),
      );

      await registerContentScript(contentScriptUrls);
      logger("Initialization complete");
      return;
    })
    .catch((error) => {
      initPromise = null;
      logger("Initialization failed: %o", error);
      throw error;
    });
  return initPromise;
}

const onInstalled: Parameters<
  typeof browser.runtime.onInstalled.addListener
>[0] = async ({ reason }) => {
  logger("Extension installed with reason: %s", reason);
  await init();
  if (reason !== "install" && reason !== "update") {
    return;
  }
  await addAnnouncement("custom-domains", reason === "update");
  await refreshIcon();
};

const onGetRegisteredUrlsMessage: Parameters<
  typeof onMessage<"getRegisteredUrls">
>[1] = async () => {
  logger("getRegisteredUrls received");
  await init();
  return Array.from(registeredUrls.keys());
};

const onRegisterUrl: Parameters<typeof onMessage<"registerUrl">>[1] = async (
  message,
) => {
  logger("registerUrl received: %s", message.data);
  await init();
  const url = message.data;
  if (registeredUrls.has(url) || newRegisteredUrls.has(url)) {
    throw ApplicationError.alreadyRegistered();
  }
  newRegisteredUrls.add(url);
  try {
    await registerContentScript([url]);
    await removeDeactivatedUrl(url);
  } finally {
    newRegisteredUrls.delete(url);
  }
};

const onUnregisterUrl: Parameters<
  typeof onMessage<"unregisterUrl">
>[1] = async (message) => {
  logger("unregisterUrl received: %s", message.data);
  await init();
  const url = message.data;
  const id = registeredUrls.get(url);
  if (id === undefined) {
    throw ApplicationError.notRegistered();
  }
  const tabIds = await getTabIds(url);
  await Promise.allSettled(
    tabIds.map((tabId) => sendMessage("notifyUnregister", tabId, tabId)),
  );
  await browser.scripting.unregisterContentScripts({ ids: [id] });
  try {
    await browser.permissions.remove({ origins: [url] });
  } catch {
    await addDeactivatedUrl(url);
  }
  registeredUrls.delete(url);
};

const onGetAnnouncementsMessage: Parameters<
  typeof onMessage<"getAnnouncements">
>[1] = async () => {
  logger("getAnnouncements received");
  await init();
  const announcements = await getActiveAnnouncements();
  return announcements;
};

const onMarkAnnouncementAsRead: Parameters<
  typeof onMessage<"markAnnoucementAsRead">
>[1] = async (message) => {
  logger("markAnnoucementAsRead received: %s", message.data);
  await init();
  const announcement = message.data;
  await markAnnoucementAsRead(announcement);
  await refreshIcon();
};

export default defineBackground(() => {
  init();

  browser.runtime.onInstalled.addListener(onInstalled);
  onMessage("getRegisteredUrls", onGetRegisteredUrlsMessage);
  onMessage("registerUrl", onRegisterUrl);
  onMessage("unregisterUrl", onUnregisterUrl);
  onMessage("getAnnouncements", onGetAnnouncementsMessage);
  onMessage("markAnnoucementAsRead", onMarkAnnouncementAsRead);
});
