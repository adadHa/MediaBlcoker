document.addEventListener('DOMContentLoaded', () => {
  const toggleSiteButton = document.getElementById('toggleSite');
  const statusElement = document.getElementById('status');
  const siteList = document.getElementById('siteList');

  function updateUI() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const currentUrl = new URL(tabs[0].url);
      const currentHost = currentUrl.hostname;

      chrome.storage.local.get(['allowedSites'], (data) => {
        const allowedSites = data.allowedSites || [];
        const isAllowed = allowedSites.includes(currentHost);

        statusElement.textContent = isAllowed ? 'Current site is allowed' : 'Current site is blocked';
        toggleSiteButton.textContent = isAllowed ? 'Block' : 'Allow';
        const index = allowedSites.indexOf(currentHost);
        if (index > -1) {
          toggleSiteButton.classList.add('btnoff');
          toggleSiteButton.classList.remove('btn');
        } else {
          toggleSiteButton.classList.add('btn');
          toggleSiteButton.classList.remove('btnoff');
        }
        updateSiteList(allowedSites);
      });
    });
  }

  function updateSiteList(sites) {
    siteList.innerHTML = '';
    sites.forEach(site => {
      const li = document.createElement('li');
      li.textContent = site;
      siteList.appendChild(li);
    });
  }

  function showConfirmationDialog(callback) {
    const overlay = document.createElement('div');
    overlay.className = 'confirmation-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';
    
    const message = document.createElement('p');
    message.textContent = 'Are you sure you want to change the blocking status for this site?';
    message.style.color = 'var(--lightText)';
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'confirmation-buttons';
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'confirm-btn';
    confirmButton.textContent = 'Confirm';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-btn';
    cancelButton.textContent = 'Cancel';
    
    buttonsContainer.appendChild(confirmButton);
    buttonsContainer.appendChild(cancelButton);
    dialog.appendChild(message);
    dialog.appendChild(buttonsContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    confirmButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
      callback(true);
    });
    
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
      callback(false);
    });
  }

  toggleSiteButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const currentUrl = new URL(tabs[0].url);
      const currentHost = currentUrl.hostname;

      chrome.storage.local.get(['allowedSites'], (data) => {
        let allowedSites = data.allowedSites || [];
        const index = allowedSites.indexOf(currentHost);
        
        // If site is blocked (going to allow it), show confirmation
        if (index === -1) {
          showConfirmationDialog((confirmed) => {
            if (confirmed) {
              allowedSites.push(currentHost);
              toggleSiteButton.classList.add('btn');
              toggleSiteButton.classList.remove('btnoff');
              
              chrome.storage.local.set({allowedSites}, () => {
                updateUI();
                chrome.tabs.sendMessage(tabs[0].id, { action: "updateBlocking" });
              });
            }
          });
        } else {
          // If site is allowed (going to block it), do it immediately
          allowedSites.splice(index, 1);
          toggleSiteButton.classList.remove('btn');
          toggleSiteButton.classList.add('btnoff');
          
          chrome.storage.local.set({allowedSites}, () => {
            updateUI();
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateBlocking" });
          });
        }
      });
    });
  });
  updateUI();
});

document.addEventListener('DOMContentLoaded', () => {
  const blurSlider = document.getElementById('blurSlider');
  const transparencySlider = document.getElementById('transparencySlider');
  const blurValue = document.getElementById('blurValue');
  const transparencyValue = document.getElementById('transparencyValue');

  function updateSettingsUI() {
    blurValue.textContent = blurSlider.value;
    transparencyValue.textContent = transparencySlider.value;
    blProgress = (blurSlider.value/blurSlider.max)*100;
    trProgress = (transparencySlider.value/transparencySlider.max)*100;
    blurSlider.style.setProperty('--range-progress', `${blProgress}%`);
    transparencySlider.style.setProperty('--range-progress', `${trProgress}%`);
  }
  

  function saveSettings() {
    chrome.storage.sync.set({
      blur: blurSlider.value,
      transparency: transparencySlider.value
    });
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        blur: blurSlider.value,
        transparency: transparencySlider.value
      });
    });
  }

  chrome.storage.sync.get(['blur', 'transparency'], (result) => {
    blurSlider.value = result.blur || 0;
    transparencySlider.value = result.transparency || 0;
    updateSettingsUI();
  });

  blurSlider.addEventListener('input', updateSettingsUI);
  transparencySlider.addEventListener('input', updateSettingsUI);
  blurSlider.addEventListener('change', saveSettings);
  transparencySlider.addEventListener('change', saveSettings);
});