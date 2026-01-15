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

  // Helper to escape regex special characters
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Create new rules
  const newRules = sites.map((siteEntry, index) => {
    // Handle both legacy (string) and new (object) formats
    const siteUrl = typeof siteEntry === 'string' ? siteEntry : siteEntry.url;
    const allowSubroutes = typeof siteEntry === 'string' ? false : siteEntry.allowSubroutes;
    
    let condition = {};
    
    if (allowSubroutes) {
        // Create a regex that matches http or https, optional www, the domain, and an optional trailing slash
        // ^https?:\/\/(www\.)?example\.com\/?$
        const escapedDomain = escapeRegex(siteUrl);
        const regex = `^https?://(www\\.)?${escapedDomain}/?$`;
        
        condition = {
            regexFilter: regex,
            resourceTypes: ['main_frame']
        };
    } else {
        condition = {
            urlFilter: siteUrl,
            resourceTypes: ['main_frame']
        };
    }
    
    return {
      id: index + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          extensionPath: '/blocked.html'
        }
      },
      condition: condition
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
