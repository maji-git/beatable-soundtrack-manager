export function convertRGBtoRGBA(rgb: Uint8Array, width: number, height: number): Uint8ClampedArray {
    const rgba = new Uint8ClampedArray(width * height * 4);

    for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
        rgba[j] = rgb[i];     // R
        rgba[j + 1] = rgb[i + 1]; // G
        rgba[j + 2] = rgb[i + 2]; // B
        rgba[j + 3] = 255;        // A (fully opaque)
    }

    return rgba;
}

export function imageDataToBlobUrl(imageData: ImageData): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    
    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                resolve(url);
            } else {
                reject(new Error("Failed to convert canvas to Blob"));
            }
        }, 'image/png');
    });
}