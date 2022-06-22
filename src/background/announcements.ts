import poly from "webextension-polyfill";

const KEY = "announcements";

const getAnnouncements = async (): Promise<Record<string, boolean>> => {
  const { [KEY]: announcements } = await poly.storage.local.get(KEY);
  return announcements;
};

const addAnnouncement = async (announcement: string): Promise<void> => {
  const announcements = await getAnnouncements();
  if (announcement in announcements) {
    return;
  }
  await poly.storage.local.set({
    [KEY]: { ...announcements, [announcement]: true },
  });
};

const removeAnnouncement = async (announcement: string): Promise<void> => {
  const announcements = await getAnnouncements();
  if (!(announcement in announcements)) {
    return;
  }
  await poly.storage.local.set({
    [KEY]: { ...announcements, [announcement]: false },
  });
};

const getActiveAnnouncements = async (): Promise<string[]> => {
  const announcements = await getAnnouncements();
  return Object.entries(announcements)
    .filter(([, isActive]) => isActive)
    .map(([announcement]) => announcement);
};

export {
  getAnnouncements,
  addAnnouncement,
  removeAnnouncement,
  getActiveAnnouncements,
};
