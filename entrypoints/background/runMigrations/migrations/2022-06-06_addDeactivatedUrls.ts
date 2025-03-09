import { storage } from "#imports";

export default {
  key: "addDeactivatedUrls",
  run: async (): Promise<void> => {
    await storage.setItem("local:deactivatedUrls", []);
  },
};
