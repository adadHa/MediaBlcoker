let styleElement = null;


if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.textContent = 'img { filter: opacity(0) !important; }';
    document.documentElement.insertBefore(styleElement, document.documentElement.firstChild);
  }
