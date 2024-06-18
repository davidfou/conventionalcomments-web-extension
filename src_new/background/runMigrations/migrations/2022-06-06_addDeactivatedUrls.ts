export default {
  key: "addDeactivatedUrls",
  run: async () => {
    await chrome.storage.local.set({ deactivatedUrls: [] });
  },
};
