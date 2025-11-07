import { browser } from "wxt/browser";

function getDomainFromUrl(url: string): string | null {
  let rawUrl: URL;
  try {
    rawUrl = new URL(url);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(rawUrl.protocol)) {
    return null;
  }
  return `${rawUrl.protocol}//${rawUrl.hostname}/*`;
}

async function getTabIds(currentUrl: string): Promise<number[]> {
  const tabs = await browser.tabs.query({});
  const tabIds: number[] = [];
  for (const tab of tabs) {
    if (
      tab.id === undefined ||
      tab.url === undefined ||
      getDomainFromUrl(tab.url) !== currentUrl
    ) {
      continue;
    }
    tabIds.push(tab.id);
  }
  return tabIds;
}

export default getTabIds;
