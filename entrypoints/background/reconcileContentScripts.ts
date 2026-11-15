import { browser } from "wxt/browser";
import { registerContentScripts } from "./contentScripts";
import logger from "./logger";

type RegisteredContentScript = {
  id: string;
  matches?: string[];
};

async function reconcileContentScripts(
  configuredUrls: readonly string[],
  registrations: readonly RegisteredContentScript[],
  registeredUrls: Map<string, string>,
): Promise<void> {
  const configuredUrlSet = new Set(configuredUrls);
  const uniqueConfiguredUrls = [...configuredUrlSet];
  const staleIds: string[] = [];

  registeredUrls.clear();
  for (const registration of registrations) {
    const url =
      registration.matches?.length === 1 ? registration.matches[0] : undefined;
    const isValid =
      typeof registration.id === "string" &&
      registration.id.length > 0 &&
      typeof url === "string" &&
      configuredUrlSet.has(url) &&
      !registeredUrls.has(url);

    if (isValid) {
      registeredUrls.set(url, registration.id);
    } else if (typeof registration.id === "string") {
      staleIds.push(registration.id);
    }
  }

  if (staleIds.length > 0) {
    logger("Unregister %d stale scripts: %o", staleIds.length, staleIds);
    await browser.scripting.unregisterContentScripts({ ids: staleIds });
  }

  const missingUrls = uniqueConfiguredUrls.filter(
    (url) => !registeredUrls.has(url),
  );
  if (missingUrls.length > 0) {
    const newRegistrations = await registerContentScripts(missingUrls);
    for (const { id, url } of newRegistrations) {
      registeredUrls.set(url, id);
    }
  }
}

export default reconcileContentScripts;
