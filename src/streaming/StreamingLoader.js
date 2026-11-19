/**
 * Yogi_PLY - On-Demand Streaming Library Loader
 * Created By Shiv Yogi
 * 
 * Loads HLS.js and DASH.js on-demand from CDN only when required.
 * Preserves lightweight core bundle for ordinary MP4/WebM playback.
 */

const HLS_CDN_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
const DASH_CDN_URL = 'https://cdn.jsdelivr.net/npm/dashjs@4/dist/dash.all.min.js';

let hlsPromise = null;
let dashPromise = null;

/**
 * Dynamically load a script by URL
 * @param {string} url
 * @returns {Promise<void>}
 */
function loadScript(url) {
  return new Promise((resolve, reject) => {
    // Check if script already exists in document
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (err) => reject(err));
      // In case it's already loaded
      if (window.Hls || window.dashjs) {
        resolve();
        return;
      }
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load streaming script: ${url}`));

    document.head.appendChild(script);
  });
}

/**
 * Ensure HLS.js is available
 * @returns {Promise<any>}
 */
export async function loadHls() {
  if (typeof window !== 'undefined' && window.Hls) {
    return window.Hls;
  }

  if (!hlsPromise) {
    hlsPromise = loadScript(HLS_CDN_URL).then(() => {
      if (window.Hls) return window.Hls;
      throw new Error('HLS.js loaded but window.Hls is not defined');
    });
  }

  return hlsPromise;
}

/**
 * Ensure DASH.js is available
 * @returns {Promise<any>}
 */
export async function loadDash() {
  if (typeof window !== 'undefined' && window.dashjs) {
    return window.dashjs;
  }

  if (!dashPromise) {
    dashPromise = loadScript(DASH_CDN_URL).then(() => {
      if (window.dashjs) return window.dashjs;
      throw new Error('DASH.js loaded but window.dashjs is not defined');
    });
  }

  return dashPromise;
}
