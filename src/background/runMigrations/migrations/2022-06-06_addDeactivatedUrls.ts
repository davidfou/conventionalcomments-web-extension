import poly from "webextension-polyfill";

export default {
  key: "addDeactivatedUrls",
  run: async () => {
    await poly.storage.local.set({ deactivatedUrls: [] });
  },
};
