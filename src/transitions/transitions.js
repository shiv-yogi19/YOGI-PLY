/**
 * Yogi_PLY - Liquid Glass Transition Utilities
 * Created By Shiv Yogi
 */

export const EASING = {
  liquid: 'cubic-bezier(0.16, 1, 0.3, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: 'cubic-bezier(0.25, 1, 0.5, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  linear: 'linear'
};

export const DURATIONS = {
  instant: 100,
  fast: 200,
  normal: 350,
  slow: 500,
  theatre: 400,
  fullscreen: 350
};

/**
 * Apply a transition style to an element safely with automatic cleanup
 * @param {HTMLElement} element
 * @param {Object} styles
 * @param {number} duration
 * @param {string} easing
 * @returns {Promise<void>}
 */
export function transitionElement(element, styles, duration = DURATIONS.normal, easing = EASING.liquid) {
  if (!element) return Promise.resolve();

  return new Promise((resolve) => {
    const props = Object.keys(styles);
    element.style.transition = props.map((p) => `${p} ${duration}ms ${easing}`).join(', ');

    requestAnimationFrame(() => {
      Object.assign(element.style, styles);

      let finished = false;
      const onEnd = () => {
        if (finished) return;
        finished = true;
        element.removeEventListener('transitionend', onEnd);
        resolve();
      };

      element.addEventListener('transitionend', onEnd, { once: true });
      setTimeout(onEnd, duration + 50);
    });
  });
}
