const KEY = "announcements";

async function getAnnouncements(): Promise<Record<string, boolean>> {
  const { [KEY]: announcements } = await chrome.storage.local.get(KEY);
  return announcements;
}

async function addAnnouncement(
  announcementKey: string,
  isActive: boolean,
): Promise<void> {
  const announcements = await getAnnouncements();

  if (announcements[announcementKey] !== undefined) {
    return;
  }
  await chrome.storage.local.set({
    [KEY]: { ...announcements, [announcementKey]: isActive },
  });
}

// TODO: rename those functions? e.g. markAnnoucementAsRead
async function removeAnnouncement(announcementKey: string): Promise<void> {
  const announcements = await getAnnouncements();
  if (announcements[announcementKey] === undefined) {
    return;
  }
  await chrome.storage.local.set({
    [KEY]: { ...announcements, [announcementKey]: false },
  });
}

async function getActiveAnnouncements(): Promise<string[]> {
  const announcements = await getAnnouncements();
  return Object.entries(announcements)
    .filter(([, isActive]) => isActive)
    .map(([announcement]) => announcement);
}

export {
  getAnnouncements,
  addAnnouncement,
  removeAnnouncement,
  getActiveAnnouncements,
};
