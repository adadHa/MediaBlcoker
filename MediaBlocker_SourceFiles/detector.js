let selfieSegmentation;

// Load the MediaPipe library
function loadMediaPipe() {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load MediaPipe library"));
        document.head.appendChild(script);
    });
}

// Load the model
async function loadModel() {
    if (!window.SelfieSegmentation) {
        await loadMediaPipe();
    }
    selfieSegmentation = new window.SelfieSegmentation.SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
    });
    await selfieSegmentation.setOptions({ modelSelection: 1 });
    await selfieSegmentation.initialize();
}

// Analyze an image
async function detectIndecency(imageSrc) {
    if (!selfieSegmentation) await loadModel();
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const results = await selfieSegmentation.send({ image: canvas });

    // Calculate "indecent level" based on segmentation results
    let humanPixelCount = 0;
    results.segmentationMask.forEach(row => {
        humanPixelCount += row.filter(pixel => pixel > 0.5).length;
    });

    const indecentLevel = humanPixelCount / (img.width * img.height);
    return indecentLevel;
}

// Listen for messages from contentAI.js
window.addEventListener("message", async (event) => {
    if (event.data.action === "analyze") {
        console.log("Detector received analyze request for:", event.data.src);
        
        try {
            const indecentLevel = await detectIndecency(event.data.src);
            console.log("Analysis completed for:", event.data.src);
            // Send result back to contentAI.js
            window.postMessage({
                action: "result",
                src: event.data.src,
                indecentLevel: indecentLevel
            }, "*");
        } catch (error) {
            console.error("Error processing image:", error);
            // Send error back to contentAI.js
            window.postMessage({
                action: "error",
                src: event.data.src,
                error: error.message
            }, "*");
        }
    }
});