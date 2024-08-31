let isBlocking = true;
let myMaxBlur = 0;
let myTransparency = 0;

function blockMedia() {
  const mediaElements = [...document.getElementsByTagName('img'), ...document.getElementsByTagName('video')];
  mediaElements.forEach(element => {
      element.style.filter = `blur(${myMaxBlur}px)`;
      element.style.opacity = (100 - myTransparency) / 100;
      if (element.tagName === 'VIDEO') {
        element.style.opacity = '0';
      }
  });
  sliders.forEach(slider => {
    slider.oninput({ target: slider, stopPropagation: () => {} });
  });
  //scanElementsAndPutSliders(mediaElements);
}

function unblockAllMedia() {
  const mediaElements = [...document.getElementsByTagName('img'), ...document.getElementsByTagName('video')];
  const overlays = document.getElementsByClassName('blur-overlay');
  
  mediaElements.forEach(element => {
      element.style.filter = 'none';
      element.style.opacity = '1';
  });
  
  Array.from(overlays).forEach(overlay => overlay.remove());
}

function checkSiteAndBlock() {
  console.log('Checking site...');
  chrome.storage.local.get(['allowedSites'], (data) => {
    console.log('Got allowed sites:', data.allowedSites);
    const currentHost = window.location.hostname;
    const allowedSites = data.allowedSites || [];

    if (allowedSites.includes(currentHost)) {
      console.log('Unblocking media...');
      unblockAllMedia();
      isBlocking = false;
    } else {
      console.log('Blocking media...');
      blockMedia();
      isBlocking = true;
    }
    console.log('Finished checking site');
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.blur !== undefined) myMaxBlur = request.blur;
  if (request.transparency !== undefined) myTransparency = request.transparency;
  checkSiteAndBlock();
});



// Load initial settings and block
chrome.storage.sync.get(['blur', 'transparency'], (result) => {
  myMaxBlur = result.blur || 0;
  myTransparency = result.transparency || 0;
  checkSiteAndBlock();
  setTimeout(() => {styleElement.disabled = true;}, 100);
});
