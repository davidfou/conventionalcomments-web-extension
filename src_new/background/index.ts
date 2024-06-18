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
  removeAnnouncement,
} from "./announcements";
import {
  BackgroundRequestMessage,
  BackgroundResponseMessage,
  GetAnnouncementsResponseMessage,
  GetRegisteredUrlsResponseMessage,
  NotifyUnregisterMessage,
  RegisterUrlMessage,
  RegisterUrlResponseMessage,
  RemoveAnnouncementMessage,
  RemoveAnnouncementResponseMessage,
  UnregisterUrlMessage,
  UnregisterUrlResponseMessage,
} from "../messageTypes";
import ApplicationError from "../ApplicationError";
import getTabIds from "./getTabIds";

const registeredUrls: Map<string, string> = new Map();
const newRegisteredUrls: Set<string> = new Set();

let initPromise: Promise<void> | null = null;
async function init(): Promise<void> {
  initPromise ??= Promise.resolve()
    .then(async () => {
      await runMigrations();
      const [permissions, deactivatedUrls] = await Promise.all([
        chrome.permissions.getAll(),
        getDeactivatedUrls(),
        refreshIcon(),
      ]);
      console.log("----");
      console.log(permissions);

      await chrome.scripting.unregisterContentScripts();

      const contentScriptUrls = (permissions.origins ?? []).filter(
        (url) => !deactivatedUrls.includes(url),
      );

      await chrome.scripting.registerContentScripts(
        contentScriptUrls.map((url, index) => {
          const id = `contentScript-${index}`;
          registeredUrls.set(url, id);
          return {
            id,
            matches: [url],
            js: ["scripts/contentScript.js"],
          };
        }),
      );
    })
    .catch((error) => {
      initPromise = null;
      throw error;
    });
  return initPromise;
}

init();

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await init();
  if (reason !== "install" && reason !== "update") {
    return;
  }
  await addAnnouncement("custom-domains", reason === "update");
  await refreshIcon();
});

async function getRegisteredUrls(): Promise<GetRegisteredUrlsResponseMessage> {
  return { urls: Array.from(registeredUrls.keys()) };
}

async function registerUrl({
  url,
}: RegisterUrlMessage): Promise<RegisterUrlResponseMessage> {
  if (registeredUrls.has(url) || newRegisteredUrls.has(url)) {
    throw ApplicationError.alreadyRegistered();
  }
  newRegisteredUrls.add(url);
  try {
    const id = `contentScript-${registeredUrls.size}`;
    await chrome.scripting.registerContentScripts([
      { id, matches: [url], js: ["scripts/contentScript.js"] },
    ]);
    await removeDeactivatedUrl(url);
    registeredUrls.set(url, id);
  } finally {
    newRegisteredUrls.delete(url);
  }
}

async function unregisterUrl({
  url,
}: UnregisterUrlMessage): Promise<UnregisterUrlResponseMessage> {
  const id = registeredUrls.get(url);
  if (id === undefined) {
    throw ApplicationError.notRegistered();
  }
  await chrome.scripting.unregisterContentScripts({ ids: [id] });
  try {
    await chrome.permissions.remove({ origins: [url] });
  } catch {
    await addDeactivatedUrl(url);
  }
  registeredUrls.delete(url);
  const tabIds = await getTabIds(url);
  tabIds.forEach((tabId) => {
    const message: NotifyUnregisterMessage = { type: "notify-unregister" };
    chrome.tabs.sendMessage(tabId, message);
  });
}

async function getAnnouncementsHandler(): Promise<GetAnnouncementsResponseMessage> {
  const announcements = await getActiveAnnouncements();
  return { announcements };
}

async function removeAnnouncementHandler({
  announcement,
}: RemoveAnnouncementMessage): Promise<RemoveAnnouncementResponseMessage> {
  await removeAnnouncement(announcement);
  await refreshIcon();
}

chrome.runtime.onMessage.addListener(
  async (
    message: BackgroundRequestMessage,
  ): Promise<BackgroundResponseMessage> => {
    try {
      await init();
      switch (message.type) {
        case "get-registered-urls":
          return getRegisteredUrls();
        case "register-url":
          return registerUrl(message);
        case "unregister-url":
          return unregisterUrl(message);
        case "get-announcements":
          return getAnnouncementsHandler();
        case "remove-announcement":
          return removeAnnouncementHandler(message);
        default: {
          const exhaustiveCheck: never = message;
          return exhaustiveCheck;
        }
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw ApplicationError.unexpectedError(
        `Something went wrong while handling '${message.type}' message`,
      );
    }
  },
);
