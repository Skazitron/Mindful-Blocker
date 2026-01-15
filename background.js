chrome.runtime.onInstalled.addListener(() => {
  // Initialize default blocked sites if needed, or just ensure storage is ready
  chrome.storage.local.get(['blockedSites'], (result) => {
    if (!result.blockedSites) {
      chrome.storage.local.set({ blockedSites: [] });
    }
  });
});

// Function to update dynamic rules
async function updateBlockingRules() {
  const result = await chrome.storage.local.get(['blockedSites']);
  const sites = result.blockedSites || [];

  // Get existing rules to remove them first
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map(rule => rule.id);

  // Create new rules
  const newRules = sites.map((site, index) => {
    return {
      id: index + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          extensionPath: '/blocked.html'
        }
      },
      condition: {
        urlFilter: site,
        resourceTypes: ['main_frame']
      }
    };
  });

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: newRules
  });
}

// Listen for storage changes to update rules
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.blockedSites) {
    updateBlockingRules();
  }
});
