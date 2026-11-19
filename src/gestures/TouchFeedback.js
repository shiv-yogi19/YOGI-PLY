/**
 * Yogi_PLY - Touch Feedback Overlays
 * Created By Shiv Yogi
 */

import { createElement } from '../utils/dom.js';
import { icons } from '../icons/svgIcons.js';

export class TouchFeedback {
  constructor(container) {
    this.container = container;
    this.overlay = null;
    this.hudBadge = null;
    this.hudTimer = null;
    this.init();
  }

  init() {
    this.overlay = createElement('div', {
      className: 'yogi-ply-gesture-overlay',
      'aria-hidden': 'true'
    });

    this.hudBadge = createElement('div', {
      className: 'yogi-ply-hud-badge'
    });

    this.overlay.appendChild(this.hudBadge);
    this.container.appendChild(this.overlay);
  }

  /**
   * Show double tap seek animation (-10s or +10s)
   * @param {'left'|'right'} side
   * @param {number} seconds
   */
  showDoubleTapSeek(side, seconds = 10) {
    const isLeft = side === 'left';
    const ripple = createElement('div', {
      className: `yogi-ply-seek-ripple yogi-ply-seek-ripple-${side}`,
      innerHTML: `
        <div class="yogi-ply-ripple-circle"></div>
        <div class="yogi-ply-ripple-content">
          ${isLeft ? icons.backward10 : icons.forward10}
          <span>${isLeft ? '-' : '+'}${Math.abs(seconds)}s</span>
        </div>
      `
    });

    this.overlay.appendChild(ripple);

    // Remove element after animation completes
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 750);
  }

  /**
   * Show HUD badge for volume or brightness
   * @param {'volume'|'brightness'} type
   * @param {number} percentage (0 to 100)
   */
  showHud(type, percentage) {
    if (this.hudTimer) {
      clearTimeout(this.hudTimer);
    }

    const icon = type === 'volume' ? icons.volumeHigh : icons.sun;
    const label = type === 'volume' ? 'Volume' : 'Brightness';
    const clampedPct = Math.max(0, Math.min(100, Math.round(percentage)));

    this.hudBadge.innerHTML = `
      <div class="yogi-ply-hud-icon">${icon}</div>
      <div class="yogi-ply-hud-details">
        <div class="yogi-ply-hud-label">${label}</div>
        <div class="yogi-ply-hud-bar">
          <div class="yogi-ply-hud-bar-fill" style="width: ${clampedPct}%"></div>
        </div>
      </div>
      <div class="yogi-ply-hud-val">${clampedPct}%</div>
    `;

    this.hudBadge.classList.add('yogi-ply-hud-visible');

    this.hudTimer = setTimeout(() => {
      this.hudBadge.classList.remove('yogi-ply-hud-visible');
    }, 1200);
  }

  destroy() {
    if (this.hudTimer) clearTimeout(this.hudTimer);
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
