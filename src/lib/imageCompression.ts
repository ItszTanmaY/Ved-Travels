/**
 * Client-side lightweight image compression using HTML5 Canvas.
 * Keeps uploaded image payloads below 100-200 KB while retaining crisp visual quality.
 * Works seamlessly on desktop and mobile browsers (camera & photo gallery).
 */
export async function compressImageFile(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, fail gracefully
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale proportionally if image width exceeds maxWidth
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            // Fallback to raw data url if canvas context cannot be created
            resolve(event.target?.result as string);
            return;
          }

          // Draw and compress to JPEG format
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } catch (err) {
          // If canvas fails for any reason, return the original data URL
          resolve(event.target?.result as string);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
