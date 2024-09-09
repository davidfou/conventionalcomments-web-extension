const KEY = "deactivatedUrls";

const getDeactivatedUrls = async (): Promise<string[]> => {
  const { [KEY]: urls } = await chrome.storage.local.get(KEY);
  return urls;
};

const addDeactivatedUrl = async (url: string): Promise<void> => {
  const currentUrls = await getDeactivatedUrls();
  if (currentUrls.includes(url)) {
    return;
  }
  await chrome.storage.local.set({ [KEY]: [...currentUrls, url] });
};

const removeDeactivatedUrl = async (url: string): Promise<void> => {
  const currentUrls = await getDeactivatedUrls();
  if (!currentUrls.includes(url)) {
    return;
  }
  await chrome.storage.local.set({
    [KEY]: currentUrls.filter((currentUrl) => currentUrl !== url),
  });
};

export { getDeactivatedUrls, addDeactivatedUrl, removeDeactivatedUrl };
