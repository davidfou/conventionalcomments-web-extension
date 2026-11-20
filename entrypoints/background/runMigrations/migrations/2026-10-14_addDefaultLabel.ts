import { storage } from "#imports";

export default {
  key: "addDefaultLabel",
  run: async (): Promise<void> => {
    await storage.setItem("local:defaultLabel", "praise");
  },
};
