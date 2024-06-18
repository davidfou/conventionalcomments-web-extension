const KEY = "deactivatedUrls";

async function getDeactivatedUrls(): Promise<string[]> {
  const { [KEY]: urls } = await chrome.storage.local.get(KEY);
  return urls;
}

async function addDeactivatedUrl(url: string): Promise<void> {
  const currentUrls = await getDeactivatedUrls();
  if (currentUrls.includes(url)) {
    return;
  }
  await chrome.storage.local.set({ [KEY]: [...currentUrls, url] });
}

async function removeDeactivatedUrl(url: string): Promise<void> {
  const currentUrls = await getDeactivatedUrls();
  if (!currentUrls.includes(url)) {
    return;
  }
  await chrome.storage.local.set({
    [KEY]: currentUrls.filter((currentUrl) => currentUrl !== url),
  });
}

export { getDeactivatedUrls, addDeactivatedUrl, removeDeactivatedUrl };
