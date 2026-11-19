/**
 * Yogi_PLY - Watermark Safe Positions System
 * Created By Shiv Yogi
 */

/**
 * Base positions inside the video viewport
 */
export const WATERMARK_POSITIONS = [
  {
    id: 'bottom-right',
    getStyle: (controlsActive, hasSubtitles) => ({
      bottom: controlsActive ? (hasSubtitles ? '140px' : '108px') : (hasSubtitles ? '80px' : '28px'),
      right: '28px',
      top: 'auto',
      left: 'auto',
      transform: 'none'
    })
  },
  {
    id: 'top-left',
    getStyle: () => ({
      top: '24px',
      left: '28px',
      bottom: 'auto',
      right: 'auto',
      transform: 'none'
    })
  },
  {
    id: 'bottom-left',
    getStyle: (controlsActive, hasSubtitles) => ({
      bottom: controlsActive ? (hasSubtitles ? '140px' : '108px') : (hasSubtitles ? '80px' : '28px'),
      left: '28px',
      top: 'auto',
      right: 'auto',
      transform: 'none'
    })
  },
  {
    id: 'top-right',
    getStyle: () => ({
      top: '24px',
      right: '28px',
      bottom: 'auto',
      left: 'auto',
      transform: 'none'
    })
  },
  {
    id: 'mid-right',
    getStyle: () => ({
      top: '45%',
      right: '28px',
      bottom: 'auto',
      left: 'auto',
      transform: 'translateY(-50%)'
    })
  },
  {
    id: 'mid-left',
    getStyle: () => ({
      top: '45%',
      left: '28px',
      bottom: 'auto',
      right: 'auto',
      transform: 'translateY(-50%)'
    })
  }
];

/**
 * Filter and compute safe positions avoiding controls and subtitles
 * @param {boolean} hasSubtitles
 * @param {boolean} controlsActive
 * @returns {Array}
 */
export function getSafePositions(hasSubtitles = false, controlsActive = true) {
  // If subtitles are showing at bottom, prefer top and mid positions to ensure zero overlap
  if (hasSubtitles) {
    return WATERMARK_POSITIONS.filter((p) => p.id.startsWith('top') || p.id.startsWith('mid')).map((pos) => ({
      id: pos.id,
      style: pos.getStyle(controlsActive, hasSubtitles)
    }));
  }

  return WATERMARK_POSITIONS.map((pos) => ({
    id: pos.id,
    style: pos.getStyle(controlsActive, hasSubtitles)
  }));
}
