import { browser } from "wxt/browser";
import ApplicationError from "~/lib/ApplicationError";
import { sendMessage } from "~/lib/messaging";
import { addConfiguredUrl, removeConfiguredUrl } from "./configuredUrls";
import { registerContentScripts } from "./contentScripts";
import getTabIds from "./getTabIds";
import logger from "./logger";

async function registerUrl(
  url: string,
  registeredUrls: Map<string, string>,
  newRegisteredUrls: Set<string>,
): Promise<void> {
  if (registeredUrls.has(url) || newRegisteredUrls.has(url)) {
    throw ApplicationError.alreadyRegistered();
  }
  newRegisteredUrls.add(url);
  try {
    const [registration] = await registerContentScripts([url]);
    if (registration === undefined) {
      throw new Error("Content script registration was not created");
    }
    try {
      await addConfiguredUrl(url);
    } catch (error) {
      try {
        await browser.scripting.unregisterContentScripts({
          ids: [registration.id],
        });
      } catch (rollbackError) {
        logger(
          "Content script registration rollback failed: %o",
          rollbackError,
        );
      }
      throw error;
    }
    registeredUrls.set(url, registration.id);
  } finally {
    newRegisteredUrls.delete(url);
  }
}

async function unregisterUrl(
  url: string,
  registeredUrls: Map<string, string>,
): Promise<void> {
  const id = registeredUrls.get(url);
  if (id === undefined) {
    throw ApplicationError.notRegistered();
  }

  await removeConfiguredUrl(url);
  await browser.scripting.unregisterContentScripts({ ids: [id] });
  try {
    await browser.permissions.remove({ origins: [url] });
  } catch (error) {
    logger("Removing the permission for %s failed: %o", url, error);
  }
  registeredUrls.delete(url);

  const tabIds = await getTabIds(url);
  await Promise.allSettled(
    tabIds.map((tabId) => sendMessage("notifyUnregister", tabId, tabId)),
  );
}

export { registerUrl, unregisterUrl };
