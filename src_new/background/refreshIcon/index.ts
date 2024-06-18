import { getActiveAnnouncements } from "../announcements";
import getIcons from "./getIcons";

async function refreshIcon(): Promise<void> {
  const announcements = await getActiveAnnouncements();
  const hasAnnouncements = Object.keys(announcements).length > 0;
  await chrome.action.setIcon({ path: getIcons("default", hasAnnouncements) });
}

export default refreshIcon;
