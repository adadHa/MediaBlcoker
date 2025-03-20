let isBlocking = true;
let myMaxBlur = 0;
let myTransparency = 0;

// Create a style element for dynamic content
const dynamicStyleElement = document.createElement('style');
document.head.appendChild(dynamicStyleElement);

function updateDynamicStyles() {
    if (isBlocking) {
        dynamicStyleElement.textContent = `
            img, video, iframe {
                filter: blur(20px) !important;
                opacity: 0.1 !important;
            }
        `;
    } else {
        dynamicStyleElement.textContent = '';
    }
}

function blockMedia() {
    const mediaElements = [...document.getElementsByTagName('img'), 
                         ...document.getElementsByTagName('video'),
                         ...document.getElementsByTagName('iframe')];
    mediaElements.forEach(element => {
        element.style.transition = 'none';
        // Remove !important from the inline styles to allow our custom settings
        element.style.setProperty('filter', `blur(${myMaxBlur}px)`, '');
        element.style.setProperty('opacity', `${(100 - myTransparency) / 100}`, '');
        
        if (element.tagName === 'VIDEO') {
            element.style.setProperty('opacity', '0', '');
        }
    });
    
    // Update the dynamic styles to match current settings
    if (isBlocking) {
        dynamicStyleElement.textContent = `
            img, video, iframe {
                filter: blur(${myMaxBlur}px) !important;
                opacity: ${(100 - myTransparency) / 100} !important;
            }
        `;
    }
    
    sliders.forEach(slider => {
        slider.oninput({ target: slider, stopPropagation: () => {} });
    });
}

function unblockAllMedia() {
    dynamicStyleElement.textContent = '';
    const mediaElements = [...document.getElementsByTagName('img'), 
                         ...document.getElementsByTagName('video'),
                         ...document.getElementsByTagName('iframe')];
    
    mediaElements.forEach((element, index) => {
        element.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            element.style.setProperty('filter', 'none', '');
            element.style.setProperty('opacity', '1', '');
        }, index * 100);
    });
}

function checkSiteAndBlock() {
    console.log('Checking site...');
    chrome.storage.local.get(['allowedSites'], (data) => {
        console.log('Got allowed sites:', data.allowedSites);
        const currentHost = window.location.hostname;
        const allowedSites = data.allowedSites || [];

        if (allowedSites.includes(currentHost)) {
            console.log('Unblocking media...');
            isBlocking = false;
            updateDynamicStyles();
            unblockAllMedia();
        } else {
            console.log('Blocking media...');
            isBlocking = true;
            updateDynamicStyles();
            blockMedia();
        }
        console.log('Finished checking site');
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.blur !== undefined) {
        myMaxBlur = request.blur;
        if (isBlocking) {
            blockMedia(); // Update blocking with new settings
        }
    }
    if (request.transparency !== undefined) {
        myTransparency = request.transparency;
        if (isBlocking) {
            blockMedia(); // Update blocking with new settings
        }
    }
    if (request.action === "updateBlocking") {
        checkSiteAndBlock();
    }
});

function isRelevantMutation(mutations) {
  for (let mutation of mutations) {
    // Check if new nodes were added
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      for (let node of mutation.addedNodes) {
        // Check if the added node is an element and not just a text node
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the node or its descendants contain media elements
          if (node.querySelector('img, video, iframe') || 
              node.tagName.toLowerCase() === 'img' || 
              node.tagName.toLowerCase() === 'video' || 
              node.tagName.toLowerCase() === 'iframe') {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedBlockMedia = debounce(() => {
  if (isBlocking) {
    blockMedia();
  }
}, 0); // Adjust the delay as needed

// Add a mutation observer to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
  if (isBlocking  && isRelevantMutation(mutations)) {
    debouncedBlockMedia();
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// Initialize dynamic styles
updateDynamicStyles();

// Load initial settings and block
chrome.storage.sync.get(['blur', 'transparency'], (result) => {
    myMaxBlur = result.blur || 0;
    myTransparency = result.transparency || 0;
    checkSiteAndBlock();
});
