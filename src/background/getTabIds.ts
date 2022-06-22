import poly from "webextension-polyfill";

import getDomainFromUrl from "../helper/getDomainFromUrl";

const getTabIds = async (currentUrl: string): Promise<number[]> => {
  const tabs = await poly.tabs.query({});
  const tabIds: number[] = [];
  tabs.forEach((tab) => {
    if (
      tab.id === undefined ||
      tab.url === undefined ||
      getDomainFromUrl(tab.url) !== currentUrl
    ) {
      return;
    }
    tabIds.push(tab.id);
  });
  return tabIds;
};

export default getTabIds;
