/**
 * Yogi_PLY - Progress and Seek Bar Component
 * Created By Shiv Yogi
 */

import { createElement, ListenerTracker, getRelativeX } from '../utils/dom.js';
import { formatTime } from '../utils/time.js';
import { escapeHtml } from '../utils/sanitize.js';

export class ProgressBar {
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
    this.bufferBar = null;
    this.playBar = null;
    this.thumb = null;
    this.tooltip = null;
    this.chaptersContainer = null;
    this.isDragging = false;

    this.init();
  }

  init() {
    this.element = createElement('div', {
      className: 'yogi-ply-progress-container',
      role: 'slider',
      tabIndex: '0',
      'aria-label': 'Seek bar',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': '0',
      'aria-valuetext': '00:00'
    });

    this.element.innerHTML = `
      <div class="yogi-ply-progress-track">
        <div class="yogi-ply-progress-buffered"></div>
        <div class="yogi-ply-progress-played"></div>
        <div class="yogi-ply-progress-chapters"></div>
        <div class="yogi-ply-progress-thumb"></div>
      </div>
      <div class="yogi-ply-progress-tooltip">00:00</div>
    `;

    this.bufferBar = this.element.querySelector('.yogi-ply-progress-buffered');
    this.playBar = this.element.querySelector('.yogi-ply-progress-played');
    this.thumb = this.element.querySelector('.yogi-ply-progress-thumb');
    this.tooltip = this.element.querySelector('.yogi-ply-progress-tooltip');
    this.chaptersContainer = this.element.querySelector('.yogi-ply-progress-chapters');

    this.container.appendChild(this.element);

    this.bindEvents();
    this.bindState();
  }

  bindEvents() {
    // Mouse hover preview tooltip
    this.tracker.add(this.element, 'mousemove', (e) => this.handleMouseMove(e));
    this.tracker.add(this.element, 'mouseleave', () => this.handleMouseLeave());

    // Mouse drag seeking
    this.tracker.add(this.element, 'mousedown', (e) => this.handleDragStart(e));
    this.tracker.add(window, 'mousemove', (e) => this.handleDragMove(e));
    this.tracker.add(window, 'mouseup', (e) => this.handleDragEnd(e));

    // Touch drag seeking
    this.tracker.add(this.element, 'touchstart', (e) => this.handleDragStart(e), { passive: false });
    this.tracker.add(window, 'touchmove', (e) => this.handleDragMove(e), { passive: false });
    this.tracker.add(window, 'touchend', (e) => this.handleDragEnd(e));
  }

  bindState() {
    this.state.on('timeupdate', () => this.updateProgress());
    this.state.on('seeking', () => this.updateProgress());
    this.state.on('change:duration', () => this.updateProgress());
    this.state.on('change:buffered', (pct) => {
      if (this.bufferBar) this.bufferBar.style.width = `${(pct * 100).toFixed(2)}%`;
    });
    this.state.on('change:chapters', (chapters) => this.renderChapters(chapters));
  }

  handleMouseMove(e) {
    if (!this.tooltip) return;
    const duration = this.state.get('duration') || 0;
    if (duration <= 0) return;

    const ratio = getRelativeX(e, this.element);
    const targetTime = ratio * duration;

    // Check for chapter title
    const chapters = this.state.get('chapters') || [];
    const activeChap = chapters.find((ch) => targetTime >= ch.start && targetTime <= ch.end);
    const chapText = activeChap ? ` - ${escapeHtml(activeChap.title)}` : '';

    this.tooltip.textContent = `${formatTime(targetTime)}${chapText}`;
    this.tooltip.style.left = `${(ratio * 100).toFixed(2)}%`;
    this.tooltip.classList.add('yogi-ply-tooltip-visible');
  }

  handleMouseLeave() {
    if (this.tooltip && !this.isDragging) {
      this.tooltip.classList.remove('yogi-ply-tooltip-visible');
    }
  }

  handleDragStart(e) {
    e.preventDefault();
    this.isDragging = true;
    this.element.classList.add('yogi-ply-progress-dragging');
    this.seekFromEvent(e);
  }

  handleDragMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.seekFromEvent(e);
  }

  handleDragEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.element.classList.remove('yogi-ply-progress-dragging');
    if (this.tooltip) {
      this.tooltip.classList.remove('yogi-ply-tooltip-visible');
    }
  }

  seekFromEvent(e) {
    const duration = this.state.get('duration') || 0;
    if (duration <= 0) return;

    const ratio = getRelativeX(e, this.element);
    const targetSeconds = ratio * duration;
    this.player.seek(targetSeconds);
    this.setProgressVisual(ratio);

    if (this.tooltip) {
      this.tooltip.textContent = formatTime(targetSeconds);
      this.tooltip.style.left = `${(ratio * 100).toFixed(2)}%`;
      this.tooltip.classList.add('yogi-ply-tooltip-visible');
    }
  }

  setProgressVisual(ratio) {
    const pct = `${(ratio * 100).toFixed(2)}%`;
    if (this.playBar) this.playBar.style.width = pct;
    if (this.thumb) this.thumb.style.left = pct;

    const duration = this.state.get('duration') || 0;
    this.element.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    this.element.setAttribute('aria-valuetext', formatTime(ratio * duration));
  }

  updateProgress() {
    if (this.isDragging) return;
    const current = this.state.get('currentTime') || 0;
    const duration = this.state.get('duration') || 0;
    const ratio = duration > 0 ? current / duration : 0;
    this.setProgressVisual(Math.min(1, Math.max(0, ratio)));
  }

  renderChapters(chapters = []) {
    if (!this.chaptersContainer) return;
    this.chaptersContainer.innerHTML = '';
    const duration = this.state.get('duration') || 0;
    if (duration <= 0 || !Array.isArray(chapters)) return;

    chapters.forEach((chap) => {
      const startRatio = chap.start / duration;
      if (startRatio > 0 && startRatio < 1) {
        const tick = createElement('div', {
          className: 'yogi-ply-chapter-tick',
          style: { left: `${(startRatio * 100).toFixed(2)}%` }
        });
        this.chaptersContainer.appendChild(tick);
      }
    });
  }

  destroy() {
    this.tracker.destroy();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
