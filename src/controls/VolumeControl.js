/**
 * Yogi_PLY - Volume Control Component
 * Created By Shiv Yogi
 */

import { createElement, ListenerTracker, getRelativeX } from '../utils/dom.js';
import { icons } from '../icons/svgIcons.js';

export class VolumeControl {
  /**
   * @param {HTMLElement} container
   * @param {Player} player
   */
  constructor(container, player) {
    this.container = container;
    this.player = player;
    this.state = player.state;
    this.tracker = new ListenerTracker();

    this.element = null;
    this.btn = null;
    this.slider = null;
    this.bar = null;
    this.thumb = null;
    this.isDragging = false;
    this.lastNonZeroVolume = 1;

    this.init();
  }

  init() {
    this.element = createElement('div', {
      className: 'yogi-ply-volume-group'
    });

    this.element.innerHTML = `
      <button class="yogi-ply-btn yogi-ply-btn-volume" aria-label="Mute or Unmute">
        <span class="yogi-ply-volume-icon">${icons.volumeHigh}</span>
      </button>
      <div class="yogi-ply-volume-slider" role="slider" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" tabIndex="0">
        <div class="yogi-ply-volume-track">
          <div class="yogi-ply-volume-fill"></div>
          <div class="yogi-ply-volume-thumb"></div>
        </div>
      </div>
    `;

    this.btn = this.element.querySelector('.yogi-ply-btn-volume');
    this.slider = this.element.querySelector('.yogi-ply-volume-slider');
    this.fill = this.element.querySelector('.yogi-ply-volume-fill');
    this.thumb = this.element.querySelector('.yogi-ply-volume-thumb');
    this.iconContainer = this.element.querySelector('.yogi-ply-volume-icon');

    this.container.appendChild(this.element);

    this.bindEvents();
    this.updateVisual(this.state.get('volume'), this.state.get('muted'));
  }

  bindEvents() {
    // Click button to toggle mute
    this.tracker.add(this.btn, 'click', () => {
      if (this.state.get('muted') || this.state.get('volume') === 0) {
        this.player.unmute();
        this.player.setVolume(this.lastNonZeroVolume || 1);
      } else {
        this.lastNonZeroVolume = this.state.get('volume') || 1;
        this.player.mute();
      }
    });

    // Slider scrubbing
    this.tracker.add(this.slider, 'mousedown', (e) => this.startDrag(e));
    this.tracker.add(window, 'mousemove', (e) => this.onDrag(e));
    this.tracker.add(window, 'mouseup', () => this.endDrag());

    // Touch support for slider
    this.tracker.add(this.slider, 'touchstart', (e) => this.startDrag(e), { passive: false });
    this.tracker.add(window, 'touchmove', (e) => this.onDrag(e), { passive: false });
    this.tracker.add(window, 'touchend', () => this.endDrag());

    // State changes
    this.state.on('change:volume', (vol) => {
      if (vol > 0) this.lastNonZeroVolume = vol;
      this.updateVisual(vol, this.state.get('muted'));
    });
    this.state.on('change:muted', (muted) => {
      this.updateVisual(this.state.get('volume'), muted);
    });
  }

  startDrag(e) {
    e.preventDefault();
    this.isDragging = true;
    this.updateFromEvent(e);
  }

  onDrag(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.updateFromEvent(e);
  }

  endDrag() {
    this.isDragging = false;
  }

  updateFromEvent(e) {
    const ratio = getRelativeX(e, this.slider);
    this.player.setVolume(ratio);
    if (this.state.get('muted') && ratio > 0) {
      this.player.unmute();
    }
  }

  updateVisual(vol, muted) {
    const effectiveVol = muted ? 0 : vol;
    const pct = `${(effectiveVol * 100).toFixed(0)}%`;

    if (this.fill) this.fill.style.width = pct;
    if (this.thumb) this.thumb.style.left = pct;
    if (this.slider) {
      this.slider.setAttribute('aria-valuenow', String(Math.round(effectiveVol * 100)));
    }

    if (effectiveVol === 0 || muted) {
      this.iconContainer.innerHTML = icons.volumeMute;
      this.btn.setAttribute('aria-label', 'Unmute');
    } else if (effectiveVol < 0.5) {
      this.iconContainer.innerHTML = icons.volumeLow;
      this.btn.setAttribute('aria-label', 'Mute');
    } else {
      this.iconContainer.innerHTML = icons.volumeHigh;
      this.btn.setAttribute('aria-label', 'Mute');
    }
  }

  destroy() {
    this.tracker.destroy();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
