import getDomainFromUrl from "../helper/getDomainFromUrl";

async function getTabIds(currentUrl: string): Promise<number[]> {
  const tabs = await chrome.tabs.query({});
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
}

export default getTabIds;
