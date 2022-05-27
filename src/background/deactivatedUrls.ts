import poly from "webextension-polyfill";

const KEY = "deactivatedUrls";

const get = async (): Promise<string[]> => {
  const { [KEY]: urls } = await poly.storage.local.get(KEY);
  return urls;
};

const add = async (url: string): Promise<void> => {
  const currentUrls = await get();
  if (currentUrls.includes(url)) {
    return;
  }
  await poly.storage.local.set({ [KEY]: [...currentUrls, url] });
};

const remove = async (url: string): Promise<void> => {
  const currentUrls = await get();
  if (!currentUrls.includes(url)) {
    return;
  }
  await poly.storage.local.set({
    [KEY]: currentUrls.filter((currentUrl) => currentUrl !== url),
  });
};

export default { get, add, remove };
