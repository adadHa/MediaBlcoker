const mediaElements = new Map(); // Stores media data

// Status Enum
const STATUS = {
    NOT_CHECKED: "Not Yet Checked",
    ANALYZING: "Now Analyzing",
    ANALYZED: "Analyzed"
};

// Find all images & videos
function scanMedia() {
    document.querySelectorAll("img, video").forEach((element) => {
        if (!mediaElements.has(element.src)) {
            mediaElements.set(element.src, { 
                ref: element, 
                type: element.tagName.toLowerCase(), 
                status: STATUS.NOT_CHECKED, 
                indecentLevel: null 
            });

            // Start analyzing
            analyzeMedia(element);
        }
    });
}

// Send media for analysis
// ... existing code ...

function analyzeMedia(element) {
    const src = element.src;
    if (!src) return;

    mediaElements.get(src).status = STATUS.ANALYZING;

    // Send message directly to detector.js
    window.postMessage({
        action: "analyze",
        src,
        type: element.tagName.toLowerCase()
    }, "*");
}

// Listen for results from detector.js
window.addEventListener("message", (event) => {
    if (event.data.action === "result") {
        console.log("ContentAI received result for:", event.data.src);
        const mediaData = mediaElements.get(event.data.src);
        if (mediaData) {
            mediaData.status = STATUS.ANALYZED;
            mediaData.indecentLevel = event.data.indecentLevel;

            if (event.data.indecentLevel > 0.5) {
                console.log(`Media with src ${event.data.src} has been flagged as indecent.`);
                mediaData.ref.style.filter = 'blur(10px)';
                mediaData.ref.style.opacity = '0.5';
            }
        }
    } else if (event.data.action === "error") {
        console.error("Error processing media:", event.data.src, event.data.error);
    }
});

// ... existing code ...

// Start scanning when page loads
scanMedia();
