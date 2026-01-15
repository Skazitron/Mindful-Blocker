// Save options to chrome.storage
function addSite() {
  const siteInput = document.getElementById('siteInput');
  const site = siteInput.value.trim();

  if (!site) return;

  chrome.storage.local.get(['blockedSites'], (result) => {
    const sites = result.blockedSites || [];
    if (!sites.includes(site)) {
      sites.push(site);
      chrome.storage.local.set({ blockedSites: sites }, () => {
        siteInput.value = '';
        restoreOptions();
        showStatus('Site blocked!');
      });
    } else {
        showStatus('Site already blocked.');
    }
  });
}

// Remove site from storage
function removeSite(site) {
  chrome.storage.local.get(['blockedSites'], (result) => {
    let sites = result.blockedSites || [];
    sites = sites.filter(s => s !== site);
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

    sites.forEach((site) => {
      const li = document.createElement('li');
      li.textContent = site;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Unblock';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => removeSite(site);
      
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
