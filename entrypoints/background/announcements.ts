import invariant from "tiny-invariant";
import { storage } from "#imports";

const KEY = "local:announcements" as const;

async function getAnnouncements(): Promise<Record<string, boolean>> {
  const announcements = await storage.getItem<Record<string, boolean>>(KEY);
  invariant(announcements !== null, "announcements should never be null");
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
  await storage.setItem(KEY, { ...announcements, [announcementKey]: isActive });
}

async function markAnnoucementAsRead(announcementKey: string): Promise<void> {
  const announcements = await getAnnouncements();
  if (announcements[announcementKey] === undefined) {
    return;
  }
  await storage.setItem(KEY, { ...announcements, [announcementKey]: false });
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
  markAnnoucementAsRead,
  getActiveAnnouncements,
};
