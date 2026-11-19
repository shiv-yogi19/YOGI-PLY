/**
 * Yogi_PLY - Permanent Creator Watermark System
 * Signature Feature: Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 *
 * Permanent Watermark Policy:
 * The watermark text is permanently fixed: "Created By Shiv Yogi"
 * It is always enabled, cannot be hidden, removed, or replaced via
 * public API, Studio dashboard, or HTML data attributes.
 * Only visual animation and transition behavior may be configured.
 */

import { createElement } from '../utils/dom.js';
import { getSafePositions } from './SafePositions.js';

export const PERMANENT_WATERMARK_TEXT = 'Created By Shiv Yogi';

export class Watermark {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   * @param {State} state
   */
  constructor(container, options = {}, state = null) {
    this.container = container;
    this.state = state;

    // Filter permitted visual settings only
    const permittedOpacity = typeof options.opacity === 'number'
      ? Math.max(0.15, Math.min(0.85, options.opacity))
      : 0.28;

    this.options = {
      // NON-NEGOTIABLE BRANDING: Always enabled and permanently fixed text
      enabled: true,
      text: PERMANENT_WATERMARK_TEXT,
      // Permitted visual settings:
      color: options.color || '#ffffff',
      opacity: permittedOpacity,
      fontSize: options.fontSize || '13px',
      interval: Math.max(3000, Number(options.interval) || 12000),
      movement: options.movement !== false,
      animationStyle: options.animationStyle || 'fade-slide', // 'fade' | 'slide' | 'fade-slide' | 'glow' | 'pulse' | 'drift'
      transitionDuration: options.transitionDuration || 600,
      easing: options.easing || 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    };

    this.currentIndex = 0;
    this.timer = null;
    this.animTimeout = null;
    this.element = null;

    this.init();
  }

  init() {
    this.element = createElement('div', {
      className: 'yogi-ply-watermark yogi-anim-watermark',
      role: 'presentation',
      'aria-hidden': 'true',
      'data-branding': 'shiv-yogi'
    });

    this.updateStyleAndText();
    this.container.appendChild(this.element);

    if (this.state) {
      // Re-evaluate position when controls visibility or subtitles change
      this.state.on('change:controlsVisible', () => this.refreshPosition());
      this.state.on('change:currentSubtitle', () => this.refreshPosition());
    }

    if (this.options.movement) {
      this.startTimer();
    }
  }

  updateStyleAndText() {
    if (!this.element) return;

    // Watermark is always visible and displays permanent text
    this.element.style.display = 'block';
    this.element.textContent = PERMANENT_WATERMARK_TEXT;
    this.element.style.color = this.options.color;
    this.element.style.opacity = String(this.options.opacity);
    this.element.style.fontSize = this.options.fontSize;

    this.refreshPosition();
  }

  refreshPosition() {
    if (!this.element) return;
    const hasSubtitles = Boolean(this.state && this.state.get('currentSubtitle') !== 'off');
    const controlsActive = Boolean(!this.state || this.state.get('controlsVisible'));
    const safePositions = getSafePositions(hasSubtitles, controlsActive);
    const pos = safePositions[this.currentIndex % safePositions.length] || safePositions[0];
    this.applyPosition(pos);
  }

  applyPosition(pos) {
    if (!this.element || !pos || !pos.style) return;
    const { top, right, bottom, left, transform } = pos.style;
    this.element.style.top = top;
    this.element.style.right = right;
    this.element.style.bottom = bottom;
    this.element.style.left = left;
    this.element.style.transform = transform;
  }

  /**
   * Smoothly move to next position using configured animation
   */
  moveToNextPosition() {
    if (!this.element || !this.options.movement) return;

    if (this.animTimeout) {
      clearTimeout(this.animTimeout);
      this.animTimeout = null;
    }

    const hasSubtitles = Boolean(this.state && this.state.get('currentSubtitle') !== 'off');
    const controlsActive = Boolean(!this.state || this.state.get('controlsVisible'));
    const safePositions = getSafePositions(hasSubtitles, controlsActive);
    this.currentIndex = (this.currentIndex + 1) % safePositions.length;
    const nextPos = safePositions[this.currentIndex];

    const dur = this.options.transitionDuration;
    const easing = this.options.easing;

    if (this.options.animationStyle === 'fade') {
      this.element.style.transition = `opacity ${dur}ms ${easing}`;
      this.element.style.opacity = '0';

      this.animTimeout = setTimeout(() => {
        if (!this.element) return;
        this.applyPosition(nextPos);
        this.element.style.opacity = String(this.options.opacity);
      }, dur + 50);
    } else if (this.options.animationStyle === 'slide') {
      this.element.style.transition = `all ${dur * 1.5}ms ${easing}`;
      this.applyPosition(nextPos);
    } else if (this.options.animationStyle === 'glow') {
      this.element.style.transition = `text-shadow ${dur}ms ease, opacity ${dur}ms ease`;
      this.element.style.textShadow = '0 0 14px rgba(255, 255, 255, 0.9)';
      this.animTimeout = setTimeout(() => {
        if (!this.element) return;
        this.applyPosition(nextPos);
        this.element.style.textShadow = 'none';
      }, dur / 2);
    } else {
      // 'fade-slide' (default cinematic liquid glass transition)
      this.element.style.transition = `opacity ${dur}ms ${easing}, transform ${dur}ms ${easing}`;
      this.element.style.opacity = '0';
      this.element.style.transform = `${nextPos.style.transform !== 'none' ? nextPos.style.transform : ''} translateY(6px) scale(0.96)`.trim();

      this.animTimeout = setTimeout(() => {
        if (!this.element) return;
        this.applyPosition(nextPos);
        void this.element.offsetWidth; // Force reflow
        this.element.style.opacity = String(this.options.opacity);
        this.element.style.transform = nextPos.style.transform;
      }, dur + 50);
    }
  }

  startTimer() {
    this.stopTimer();
    if (!this.options.movement) return;

    const interval = Math.max(3000, Number(this.options.interval) || 12000);
    this.timer = setInterval(() => {
      this.moveToNextPosition();
    }, interval);
    if (this.timer && typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.animTimeout) {
      clearTimeout(this.animTimeout);
      this.animTimeout = null;
    }
  }

  /**
   * Update watermark visual settings dynamically.
   * Permitted visual settings: animationStyle, movement, transitionSpeed/interval,
   * duration, easing, opacity (within sensible branding limits).
   * Attempts to change text or set enabled to false are strictly ignored.
   * @param {Object} newOptions
   */
  setOptions(newOptions = {}) {
    // Only extract permitted visual options
    if (typeof newOptions.opacity === 'number') {
      this.options.opacity = Math.max(0.15, Math.min(0.85, newOptions.opacity));
    }
    if (typeof newOptions.animationStyle === 'string') {
      this.options.animationStyle = newOptions.animationStyle;
    }
    if (typeof newOptions.movement === 'boolean') {
      this.options.movement = newOptions.movement;
    }
    if (newOptions.interval) {
      this.options.interval = Math.max(3000, Number(newOptions.interval));
    }
    if (newOptions.transitionDuration) {
      this.options.transitionDuration = Math.max(200, Number(newOptions.transitionDuration));
    }
    if (newOptions.easing) {
      this.options.easing = newOptions.easing;
    }
    if (newOptions.color) {
      this.options.color = newOptions.color;
    }
    if (newOptions.fontSize) {
      this.options.fontSize = newOptions.fontSize;
    }

    // Always enforce non-negotiable branding
    this.options.enabled = true;
    this.options.text = PERMANENT_WATERMARK_TEXT;

    this.updateStyleAndText();

    if (this.options.movement) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  destroy() {
    this.stopTimer();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
