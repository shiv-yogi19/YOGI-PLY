/**
 * Yogi_PLY - Time Utilities
 * Created By Shiv Yogi
 */

/**
 * Format seconds into mm:ss or hh:mm:ss
 * @param {number} seconds
 * @param {boolean} forceHours
 * @returns {string}
 */
export function formatTime(seconds, forceHours = false) {
  if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) {
    return forceHours ? '00:00:00' : '00:00';
  }

  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);

  const pad = (n) => (n < 10 ? '0' + n : String(n));

  if (h > 0 || forceHours) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

/**
 * Parse time string (hh:mm:ss or mm:ss or ss) to seconds
 * @param {string} timeStr
 * @returns {number}
 */
export function parseTime(timeStr) {
  if (typeof timeStr === 'number') return timeStr;
  if (!timeStr || typeof timeStr !== 'string') return 0;

  const parts = timeStr.trim().split(':').map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}
