/**
 * Yogi_PLY - Time Display Component
 * Created By Shiv Yogi
 */

import { createElement } from '../utils/dom.js';
import { formatTime } from '../utils/time.js';

export class TimeDisplay {
  /**
   * @param {HTMLElement} container
   * @param {Player} player
   */
  constructor(container, player) {
    this.container = container;
    this.player = player;
    this.state = player.state;

    this.element = null;
    this.currentSpan = null;
    this.durationSpan = null;

    this.init();
  }

  init() {
    this.element = createElement('div', {
      className: 'yogi-ply-time-display',
      'aria-live': 'off'
    });

    this.currentSpan = createElement('span', { className: 'yogi-ply-time-current', textContent: '00:00' });
    const separator = createElement('span', { className: 'yogi-ply-time-separator', textContent: ' / ' });
    this.durationSpan = createElement('span', { className: 'yogi-ply-time-duration', textContent: '00:00' });

    this.element.appendChild(this.currentSpan);
    this.element.appendChild(separator);
    this.element.appendChild(this.durationSpan);

    this.container.appendChild(this.element);

    this.state.on('timeupdate', () => this.update());
    this.state.on('change:duration', () => this.update());
  }

  update() {
    const cur = this.state.get('currentTime') || 0;
    const dur = this.state.get('duration') || 0;
    const forceHours = dur >= 3600;

    if (this.currentSpan) this.currentSpan.textContent = formatTime(cur, forceHours);
    if (this.durationSpan) this.durationSpan.textContent = formatTime(dur, forceHours);
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
