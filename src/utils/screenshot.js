/**
 * Yogi_PLY - Video Screenshot Utility
 * Created By Shiv Yogi
 */

/**
 * Capture current frame from HTMLVideoElement and trigger download
 * @param {HTMLVideoElement} video
 * @param {string} [filename]
 * @returns {Promise<{ dataUrl: string, blob: Blob }>}
 */
export async function captureScreenshot(video, filename = null) {
  if (!video || !video.videoWidth || !video.videoHeight) {
    throw new Error('Video is not ready or has no valid visual dimensions');
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create canvas 2D rendering context');
  }

  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } catch (err) {
    // Canvas tainted by cross-origin video without CORS headers
    throw new Error('Screenshot failed: Cross-Origin restrictions prevent capturing frames without CORS headers on media.');
  }

  return new Promise((resolve, reject) => {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob'));
          return;
        }

        const actualFilename =
          filename ||
          `yogi-ply-snap-${Math.floor(video.currentTime)}s-${Date.now()}.png`;

        const link = document.createElement('a');
        link.download = actualFilename;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(link.href), 5000);

        resolve({ dataUrl, blob, filename: actualFilename });
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}
