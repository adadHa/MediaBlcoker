// content.js
const sliders = new Map();
const MAX_REVEAL_SPEED = 1.5; // Percentage per frame (adjust this value to control maximum reveal speed)
let animationFrameIds = new Map(); // To store animation frame IDs for each element

function createSlider(element) {
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '0';
  slider.style.position = 'absolute';
  slider.style.zIndex = '9999';
  slider.style.opacity = '0';
  slider.style.transition = 'opacity 0.5s';
  slider.oninput = (e) => {
    e.stopPropagation();
    adjustMedia(element, slider.value);
  };
  slider.onmouseover = (e) => {
    e.stopPropagation();
    clearTimeout(slider.fadeOutTimer);
}
  slider.onmouseout = (e) => {
    e.stopPropagation();
    slider.fadeOutTimer = setTimeout(() => fadeOutSlider(slider), 1000);
}
  return slider;
}

function addOrShowSlider(element) {
  chrome.storage.local.get(['allowedSites'], (data) => {
    const currentHost = window.location.hostname;
    const allowedSites = data.allowedSites || [];
    
    // Don't show slider if site is allowed
    if (allowedSites.includes(currentHost)) {
      return;
    }

    let slider = sliders.get(element);
    if (!slider) {
      slider = createSlider(element);
      sliders.set(element, slider);
      document.body.appendChild(slider);
    }
    positionSlider(slider, element);
    fadeInSlider(slider);
  });
}

function positionSlider(slider, element) {
  const rect = element.getBoundingClientRect();
  slider.style.left = `${rect.left + rect.width / 2 - slider.offsetWidth / 2}px`;
  slider.style.top = `${rect.bottom + window.scrollY - 10}px`;
}

function adjustMedia(element, targetValue) {
  // Clear any existing animation for this element
  if (animationFrameIds.has(element)) {
    cancelAnimationFrame(animationFrameIds.get(element));
  }

  // Get current values
  const currentBlur = parseFloat(element.style.filter?.match(/blur\(([^)]+)\)/)?.[1] || myMaxBlur);
  const currentOpacity = parseFloat(element.style.opacity || 1);
  
  // Calculate target values
  const targetP = parseFloat(100 - targetValue);
  const targetBlur = (parseFloat(targetP/100)) * myMaxBlur;
  const targetOpacity = 1-(targetP/100)*(myTransparency/100);

  // If reducing visibility (increasing blur/reducing opacity), do it instantly
  if (targetBlur > currentBlur || targetOpacity < currentOpacity) {
    element.style.filter = `blur(${targetBlur}px)`;
    element.style.opacity = targetOpacity;
    return;
  }

  // For increasing visibility, animate gradually
  function animate() {
    const currentBlur = parseFloat(element.style.filter?.match(/blur\(([^)]+)\)/)?.[1] || myMaxBlur);
    const currentOpacity = parseFloat(element.style.opacity || 1);
    
    // Calculate new values with speed limit
    let newBlur = Math.max(targetBlur, currentBlur - (myMaxBlur * (MAX_REVEAL_SPEED/100)));
    let newOpacity = Math.min(targetOpacity, currentOpacity + (MAX_REVEAL_SPEED/100));
    
    // Apply new values
    element.style.filter = `blur(${newBlur}px)`;
    element.style.opacity = newOpacity;
    
    // Continue animation if not reached target
    if (newBlur > targetBlur || newOpacity < targetOpacity) {
      animationFrameIds.set(element, requestAnimationFrame(animate));
    } else {
      animationFrameIds.delete(element);
    }
  }

  // Start animation
  animate();
}

function fadeInSlider(slider) {
  clearTimeout(slider.fadeOutTimer);
  slider.style.opacity = '1';
  slider.fadeOutTimer = setTimeout(() => fadeOutSlider(slider), 1000);
}

function fadeOutSlider(slider) {
  slider.style.opacity = '0';
}

document.addEventListener('mouseover', (e) => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
    addOrShowSlider(e.target);
  }
}, true);