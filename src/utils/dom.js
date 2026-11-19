/**
 * Yogi_PLY - DOM Utilities
 * Created By Shiv Yogi
 */

/**
 * Helper to create DOM element with attributes, classes, and children
 * @param {string} tag
 * @param {Object} [attrs={}]
 * @param {Array|string|Element} [children=[]]
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;

    if (key === 'className' || key === 'class') {
      element.className = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key === 'textContent' || key === 'text') {
      element.textContent = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (typeof value === 'boolean') {
      if (value) {
        element.setAttribute(key, '');
      }
    } else {
      element.setAttribute(key, String(value));
    }
  }

  const childArray = Array.isArray(children) ? children : [children];
  for (const child of childArray) {
    if (!child) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }

  return element;
}

/**
 * Listener manager that records bound events for safe bulk cleanup
 */
export class ListenerTracker {
  constructor() {
    this.listeners = [];
  }

  /**
   * Add an event listener and track it
   */
  add(target, event, handler, options = false) {
    if (!target) return;
    target.addEventListener(event, handler, options);
    this.listeners.push({ target, event, handler, options });
  }

  /**
   * Remove a specific tracked listener
   */
  remove(target, event, handler) {
    if (!target) return;
    target.removeEventListener(event, handler);
    this.listeners = this.listeners.filter(
      (l) => !(l.target === target && l.event === event && l.handler === handler)
    );
  }

  /**
   * Remove all tracked listeners
   */
  destroy() {
    for (const { target, event, handler, options } of this.listeners) {
      try {
        target.removeEventListener(event, handler, options);
      } catch (e) {
        // ignore errors on removed nodes
      }
    }
    this.listeners = [];
  }
}

/**
 * Check if the current device/browser supports touch
 * @returns {boolean}
 */
export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Get normalized relative X position (0 to 1) from MouseEvent or TouchEvent
 * @param {MouseEvent|TouchEvent} event
 * @param {HTMLElement} element
 * @returns {number} 0 to 1
 */
export function getRelativeX(event, element) {
  const rect = element.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const relativeX = (clientX - rect.left) / rect.width;
  return Math.max(0, Math.min(1, relativeX));
}

/**
 * Get normalized relative Y position (0 to 1) from MouseEvent or TouchEvent
 * (1 at top, 0 at bottom or standard 0 to 1)
 * @param {MouseEvent|TouchEvent} event
 * @param {HTMLElement} element
 * @returns {number} 0 to 1
 */
export function getRelativeY(event, element) {
  const rect = element.getBoundingClientRect();
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  const relativeY = 1 - (clientY - rect.top) / rect.height;
  return Math.max(0, Math.min(1, relativeY));
}
