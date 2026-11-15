import invariant from "tiny-invariant";
import { storage } from "#imports";

const KEY = "local:configuredUrls" as const;

async function getConfiguredUrls(): Promise<string[]> {
  const urls = await storage.getItem<string[]>(KEY);
  invariant(urls !== null, "configuredUrls should never be null");
  return urls;
}

async function setConfiguredUrls(urls: readonly string[]): Promise<void> {
  await storage.setItem(KEY, [...new Set(urls)]);
}

async function addConfiguredUrl(url: string): Promise<void> {
  const urls = await getConfiguredUrls();
  if (urls.includes(url)) {
    return;
  }
  await setConfiguredUrls([...urls, url]);
}

async function removeConfiguredUrl(url: string): Promise<void> {
  const urls = await getConfiguredUrls();
  if (!urls.includes(url)) {
    return;
  }
  await setConfiguredUrls(
    urls.filter((configuredUrl) => configuredUrl !== url),
  );
}

export { getConfiguredUrls, addConfiguredUrl, removeConfiguredUrl };
