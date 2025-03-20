let styleElement = null;

if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.textContent = `
        img, video, iframe {
            filter: blur(20px) !important;
            opacity: 0.1 !important;
        }
        /* Prevent any transition effects that might show content */
        * {
            transition: none !important;
            animation: none !important;
        }
    `;
    document.documentElement.insertBefore(styleElement, document.documentElement.firstChild);
}
