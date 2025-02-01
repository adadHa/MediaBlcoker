importScripts("https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js");

let selfieSegmentation;

async function loadModel() {
    selfieSegmentation = new SelfieSegmentation.SelfieSegmentation({
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

    const canvas = new OffscreenCanvas(img.width, img.height);
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

// Listen for tasks
onmessage = async (event) => {
    if (event.data === "ready") {
        self.postMessage("ready");
        return;
    }
    
    console.log("Worker received message for:", event.data.src);
    try {
        const indecentLevel = await detectIndecency(event.data.src);
        console.log("Worker completed analysis for:", event.data.src);
        // Ensure we're sending a proper message
        self.postMessage({
            src: event.data.src,
            indecentLevel: indecentLevel
        });
    } catch (error) {
        console.error("Worker error:", error);
        self.postMessage({
            error: true,
            message: error.message
        });
    }
};
