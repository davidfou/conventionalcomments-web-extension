import { browser } from "wxt/browser";
import runMigrations from "./runMigrations";
import refreshIcon from "./refreshIcon";
import { getConfiguredUrls } from "./configuredUrls";
import {
  addAnnouncement,
  getActiveAnnouncements,
  markAnnoucementAsRead,
} from "./announcements";
import { defineBackground } from "#imports";
import { onMessage } from "~/lib/messaging";
import logger from "./logger";
import reconcileContentScripts from "./reconcileContentScripts";
import { registerUrl, unregisterUrl } from "./urlRegistrationActions";

const newRegisteredUrls: Set<string> = new Set();
const registeredUrls: Map<string, string> = new Map();
let initPromise: Promise<void> | null = null;

function init(): Promise<void> {
  initPromise ??= Promise.resolve()
    .then(async () => {
      logger("Start initialization");
      await runMigrations();
      const [configuredUrls, registrations] = await Promise.all([
        getConfiguredUrls(),
        browser.scripting.getRegisteredContentScripts(),
        refreshIcon(),
      ]);

      await reconcileContentScripts(
        configuredUrls,
        registrations,
        registeredUrls,
      );
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
  await registerUrl(message.data, registeredUrls, newRegisteredUrls);
};

const onUnregisterUrl: Parameters<
  typeof onMessage<"unregisterUrl">
>[1] = async (message) => {
  logger("unregisterUrl received: %s", message.data);
  await init();
  await unregisterUrl(message.data, registeredUrls);
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
