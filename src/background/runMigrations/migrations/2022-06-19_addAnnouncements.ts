import poly from "webextension-polyfill";

export default {
  key: "addAnnouncements",
  run: async () => {
    await poly.storage.local.set({ announcements: {} });
  },
};
