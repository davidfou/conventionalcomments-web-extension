import invariant from "tiny-invariant";
import { storage } from "#imports";

const KEY = "local:deactivatedUrls" as const;

async function getDeactivatedUrls(): Promise<string[]> {
  const urls = await storage.getItem<string[]>(KEY);
  invariant(urls !== null, "deactivatedUrls should never be null");
  return urls;
}

async function addDeactivatedUrl(url: string): Promise<void> {
  const currentUrls = await getDeactivatedUrls();
  if (currentUrls.includes(url)) {
    return;
  }
  await storage.setItem(KEY, [...currentUrls, url]);
}

async function removeDeactivatedUrl(url: string): Promise<void> {
  const currentUrls = await getDeactivatedUrls();
  if (!currentUrls.includes(url)) {
    return;
  }
  await storage.setItem(
    KEY,
    currentUrls.filter((currentUrl) => currentUrl !== url),
  );
}

export { getDeactivatedUrls, addDeactivatedUrl, removeDeactivatedUrl };
