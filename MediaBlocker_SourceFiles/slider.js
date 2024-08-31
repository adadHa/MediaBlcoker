// content.js
const sliders = new Map();

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
  let slider = sliders.get(element);
  if (!slider) {
    slider = createSlider(element);
    sliders.set(element, slider);
    document.body.appendChild(slider);
  }
  positionSlider(slider, element);
  fadeInSlider(slider);
}

function positionSlider(slider, element) {
  const rect = element.getBoundingClientRect();
  slider.style.left = `${rect.left + rect.width / 2 - slider.offsetWidth / 2}px`;
  slider.style.top = `${rect.bottom + window.scrollY - 10}px`;
}

function adjustMedia(element, value) {
  //example: value=20,myTr=60 => bl=   ;tr=0.8


  let p = parseFloat(100 - value);
  let bl = (parseFloat(p/100))*myMaxBlur;
  let op = 1-(p/100)*(myTransparency/100);
  console.log(' Blur:', bl, ' Opacity:', op);
  element.style.filter = `blur(${bl}px)`;
  element.style.opacity = op;
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