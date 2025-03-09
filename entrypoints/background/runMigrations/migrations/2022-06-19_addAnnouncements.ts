import { storage } from "#imports";

export default {
  key: "addAnnouncements",
  run: async (): Promise<void> => {
    await storage.setItem("local:announcements", []);
  },
};
