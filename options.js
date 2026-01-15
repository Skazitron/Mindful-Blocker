// Save options to chrome.storage
function addSite() {
  const siteInput = document.getElementById('siteInput');
  const allowSubroutesCheckbox = document.getElementById('allowSubroutes');
  const site = siteInput.value.trim();
  const allowSubroutes = allowSubroutesCheckbox.checked;

  if (!site) return;

  chrome.storage.local.get(['blockedSites'], (result) => {
    const sites = result.blockedSites || [];
    // Check if site already exists (checking the 'url' property or string itself)
    const exists = sites.some(s => (typeof s === 'string' ? s : s.url) === site);
    
    if (!exists) {
      sites.push({ url: site, allowSubroutes: allowSubroutes });
      chrome.storage.local.set({ blockedSites: sites }, () => {
        siteInput.value = '';
        allowSubroutesCheckbox.checked = false;
        restoreOptions();
        showStatus('Site blocked!');
      });
    } else {
        showStatus('Site already blocked.');
    }
  });
}

// Remove site from storage
function removeSite(siteUrl) {
  chrome.storage.local.get(['blockedSites'], (result) => {
    let sites = result.blockedSites || [];
    sites = sites.filter(s => (typeof s === 'string' ? s : s.url) !== siteUrl);
    chrome.storage.local.set({ blockedSites: sites }, () => {
      restoreOptions();
      showStatus('Site unblocked.');
    });
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.local.get(['blockedSites'], (result) => {
    const sites = result.blockedSites || [];
    const siteList = document.getElementById('siteList');
    siteList.innerHTML = '';

    sites.forEach((siteEntry) => {
      const siteUrl = typeof siteEntry === 'string' ? siteEntry : siteEntry.url;
      const allowSubroutes = typeof siteEntry === 'string' ? false : siteEntry.allowSubroutes;

      const li = document.createElement('li');
      li.textContent = siteUrl + (allowSubroutes ? ' (Homepage only)' : '');
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Unblock';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => removeSite(siteUrl);
      
      li.appendChild(deleteBtn);
      siteList.appendChild(li);
    });
  });
}

function showStatus(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    setTimeout(() => {
        status.textContent = '';
    }, 2000);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('addBtn').addEventListener('click', addSite);
