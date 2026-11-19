/**
 * Yogi_PLY - Fullscreen Cross-Browser Utilities
 * Created By Shiv Yogi
 */

/**
 * Check if fullscreen is currently active for an element or whole document
 * @param {HTMLElement} [element]
 * @returns {boolean}
 */
export function isFullscreen(element) {
  const fsElement =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  if (!element) {
    return Boolean(fsElement);
  }
  return fsElement === element;
}

/**
 * Request fullscreen with cross-browser and mobile support
 * @param {HTMLElement} element
 * @param {HTMLVideoElement} [video]
 * @returns {Promise<void>}
 */
export async function requestFullscreen(element, video) {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    return element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    return element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    return element.msRequestFullscreen();
  } else if (video && video.webkitEnterFullscreen) {
    // iOS Safari fallback
    return video.webkitEnterFullscreen();
  }
}

/**
 * Exit fullscreen with cross-browser support
 * @param {HTMLVideoElement} [video]
 * @returns {Promise<void>}
 */
export async function exitFullscreen(video) {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    return document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    return document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    return document.msExitFullscreen();
  } else if (video && video.webkitExitFullscreen) {
    return video.webkitExitFullscreen();
  }
}

/**
 * Get the vendor-prefixed fullscreen change event name
 * @returns {string}
 */
export function getFullscreenChangeEventName() {
  if ('onfullscreenchange' in document) return 'fullscreenchange';
  if ('onwebkitfullscreenchange' in document) return 'webkitfullscreenchange';
  if ('onmozfullscreenchange' in document) return 'mozfullscreenchange';
  if ('onMSFullscreenChange' in document) return 'MSFullscreenChange';
  return 'fullscreenchange';
}
