chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ allowedSites: [] });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: "updateBlocking" });
  }
});

// Clear the allowedSites list when the browser is closed
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ allowedSites: [] });
});

