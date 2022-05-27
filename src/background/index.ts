import poly from "webextension-polyfill";
import "content-scripts-register-polyfill";

import ApplicationError from "../ApplicationError";
import initialize from "./initialize";
import registerContentScript from "./registerContentScript";
import getTabIds from "./getTabIds";
import deactivatedUrls from "./deactivatedUrls";

import type {
  BackgroundRequestMessage,
  GetRegisteredUrlsResponseMessage,
  RegisterUrlMessage,
  UnregisterUrlMessage,
  NotifyUnregisterMessage,
} from "../messageTypes";

const registeredUrls: Map<string, { unregister: () => void }> = new Map();
const newRegisteredUrls: Set<string> = new Set();

const extensionInitialization = initialize(registeredUrls);

const getRegisteredUrls =
  async (): Promise<GetRegisteredUrlsResponseMessage> => ({
    urls: Object.keys(Object.fromEntries(registeredUrls)),
  });

const registerUrl = async ({ url }: RegisterUrlMessage): Promise<void> => {
  if (registeredUrls.has(url) || newRegisteredUrls.has(url)) {
    throw ApplicationError.alreadyRegistered();
  }
  newRegisteredUrls.add(url);
  try {
    const { unregister } = await registerContentScript(url);
    await deactivatedUrls.remove(url);
    registeredUrls.set(url, { unregister });
  } finally {
    newRegisteredUrls.delete(url);
  }
};

const unregisterUrl = async ({ url }: UnregisterUrlMessage): Promise<void> => {
  const registeredUrl = registeredUrls.get(url);
  if (registeredUrl === undefined) {
    throw ApplicationError.notRegistered();
  }
  registeredUrl.unregister();
  try {
    await poly.permissions.remove({ origins: [url] });
  } catch (error) {
    await deactivatedUrls.add(url);
  }
  registeredUrls.delete(url);
  const tabIds = await getTabIds(url);
  tabIds.forEach((id) => {
    const message: NotifyUnregisterMessage = { type: "notify-unregister" };
    poly.tabs.sendMessage(id, message);
  });
};

poly.runtime.onMessage.addListener(
  async (
    message: BackgroundRequestMessage
  ): Promise<GetRegisteredUrlsResponseMessage | void> => {
    try {
      await extensionInitialization;
      switch (message.type) {
        case "get-registered-urls":
          return getRegisteredUrls();
        case "register-url":
          return registerUrl(message);
        case "unregister-url":
          return unregisterUrl(message);
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
        `Something went wrong while handling '${message.type}' message`
      );
    }
  }
);
