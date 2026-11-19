/**
 * Yogi_PLY - Animation & Transition Engine
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

export const ANIMATION_VARIANTS = [
  'player-enter',
  'player-exit',
  'play-tap',
  'pause-tap',
  'btn-press',
  'btn-glow',
  'dock-enter',
  'dock-exit',
  'dock-auto-hide',
  'more-tap',
  'menu-expand',
  'menu-collapse',
  'panel-enter',
  'panel-exit',
  'seek-active',
  'seek-preview',
  'volume-slide',
  'spinner',
  'buffering',
  'sub-enter',
  'sub-exit',
  'playlist-enter',
  'playlist-exit',
  'theme-transition',
  'fullscreen-enter',
  'theatre-transition',
  'doubletap-ripple',
  'fwd-feedback',
  'back-feedback',
  'gesture-hud',
  'watermark-move',
  'watermark-drift',
  'tooltip-enter',
  'error-bounce',
  'select-feedback',
  'speed-feedback',
  'chapter-feedback',
  'screenshot-flash',
  'pip-feedback',
  'hud-pulse'
];

export const ANIMATION_PRESETS = {
  cinematic: {
    durationMultiplier: 1.0,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    intensity: 'medium'
  },
  smooth: {
    durationMultiplier: 1.3,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    intensity: 'soft'
  },
  instant: {
    durationMultiplier: 0.2,
    easing: 'linear',
    intensity: 'minimal'
  },
  subtle: {
    durationMultiplier: 0.8,
    easing: 'ease-out',
    intensity: 'low'
  },
  spring: {
    durationMultiplier: 1.1,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    intensity: 'high'
  }
};

export class AnimationEngine {
  /**
   * @param {HTMLElement} playerContainer
   * @param {Object} options
   */
  constructor(playerContainer, options = {}) {
    this.container = playerContainer;
    this.preset = options.preset || 'cinematic';
    this.reducedMotion = false;

    this.checkReducedMotion();
  }

  checkReducedMotion() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = mq.matches;
      if (mq.addEventListener) {
        mq.addEventListener('change', (e) => {
          this.reducedMotion = e.matches;
        });
      }
    }
  }

  /**
   * Trigger an animation class on an element and clean up automatically
   * @param {HTMLElement} element
   * @param {string} animationName
   * @param {number} fallbackDurationMs
   * @returns {Promise<void>}
   */
  trigger(element, animationName, fallbackDurationMs = 400) {
    if (!element || this.reducedMotion) return Promise.resolve();

    const className = `yogi-anim-${animationName}`;
    element.classList.remove(className);
    void element.offsetWidth; // Force reflow
    element.classList.add(className);

    return new Promise((resolve) => {
      let resolved = false;
      const cleanup = () => {
        if (resolved) return;
        resolved = true;
        element.classList.remove(className);
        element.removeEventListener('animationend', cleanup);
        resolve();
      };

      element.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, fallbackDurationMs + 50);
    });
  }

  /**
   * Flash screenshot capture overlay
   */
  flashScreenshot() {
    if (this.reducedMotion || !this.container) return;
    const flash = document.createElement('div');
    flash.className = 'yogi-anim-screenshot-flash';
    this.container.appendChild(flash);
    setTimeout(() => {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 450);
  }

  /**
   * Set animation preset
   * @param {string} presetName
   */
  setPreset(presetName) {
    if (ANIMATION_PRESETS[presetName]) {
      this.preset = presetName;
    }
  }

  /**
   * Get list of all available animation variants
   * @returns {string[]}
   */
  getVariants() {
    return [...ANIMATION_VARIANTS];
  }
}
