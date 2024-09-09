import ApplicationError from "../ApplicationError";
import initialize from "./initialize";
import getTabIds from "./getTabIds";
import { addDeactivatedUrl, removeDeactivatedUrl } from "./deactivatedUrls";
import {
  getActiveAnnouncements,
  addAnnouncement,
  removeAnnouncement,
} from "./announcements";
import refreshIcon from "./refreshIcon";

import type {
  BackgroundRequestMessage,
  GetRegisteredUrlsResponseMessage,
  RegisterUrlMessage,
  UnregisterUrlMessage,
  NotifyUnregisterMessage,
  GetAnnouncementsResponseMessage,
  RemoveAnnouncementMessage,
} from "../messageTypes";

const registeredUrls: Map<string, string> = new Map();
const newRegisteredUrls: Set<string> = new Set();

const extensionInitialization = initialize(registeredUrls);

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await extensionInitialization;
  if (reason !== "update") {
    return;
  }
  await addAnnouncement("custom-domains");
  await refreshIcon();
});

const getRegisteredUrls =
  async (): Promise<GetRegisteredUrlsResponseMessage> => ({
    urls: Object.keys(Object.fromEntries(registeredUrls)),
  });

const registerUrl = async ({ url }: RegisterUrlMessage): Promise<null> => {
  if (registeredUrls.has(url) || newRegisteredUrls.has(url)) {
    throw ApplicationError.alreadyRegistered();
  }
  newRegisteredUrls.add(url);
  try {
    const id = `contentScript-${registeredUrls.size}`;
    await chrome.scripting.registerContentScripts([
      {
        id,
        matches: [url],
        js: ["build/contentScript.js"],
        css: ["build/contentScript.css"],
      },
    ]);
    await removeDeactivatedUrl(url);
    registeredUrls.set(url, id);
  } finally {
    newRegisteredUrls.delete(url);
  }
  return null;
};

const unregisterUrl = async ({ url }: UnregisterUrlMessage): Promise<null> => {
  const id = registeredUrls.get(url);
  if (id === undefined) {
    throw ApplicationError.notRegistered();
  }
  await chrome.scripting.unregisterContentScripts({ ids: [id] });
  try {
    await chrome.permissions.remove({ origins: [url] });
  } catch (error) {
    await addDeactivatedUrl(url);
  }
  registeredUrls.delete(url);
  const tabIds = await getTabIds(url);
  tabIds.forEach((tabId) => {
    const message: NotifyUnregisterMessage = { type: "notify-unregister" };
    chrome.tabs.sendMessage(tabId, message);
  });
  return null;
};

const getAnnouncementsHandler =
  async (): Promise<GetAnnouncementsResponseMessage> => {
    const announcements = await getActiveAnnouncements();
    return { announcements };
  };

const removeAnnouncementHandler = async ({
  announcement,
}: RemoveAnnouncementMessage): Promise<null> => {
  await removeAnnouncement(announcement);
  await refreshIcon();
  return null;
};

function getResponse(
  message: BackgroundRequestMessage
): Promise<
  GetRegisteredUrlsResponseMessage | GetAnnouncementsResponseMessage | null
> {
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
}

chrome.runtime.onMessage.addListener(
  (message: BackgroundRequestMessage, _sender, sendResponse): boolean => {
    getResponse(message)
      .then((data) => {
        sendResponse(data);
      })
      .catch((error) => {
        if (error instanceof ApplicationError) {
          throw error;
        }
        throw ApplicationError.unexpectedError(
          `Something went wrong while handling '${message.type}' message`
        );
      });
    return true;
  }
);
