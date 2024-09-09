export default {
  key: "addAnnouncements",
  run: async () => {
    await chrome.storage.local.set({ announcements: {} });
  },
};
