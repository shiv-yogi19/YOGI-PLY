/**
 * Yogi_PLY - EventEmitter
 * Created By Shiv Yogi
 */

export class EventEmitter {
  constructor() {
    this._events = new Map();
  }

  /**
   * Register an event listener
   * @param {string} event
   * @param {Function} listener
   */
  on(event, listener) {
    if (typeof listener !== 'function') return this;
    if (!this._events.has(event)) {
      this._events.set(event, new Set());
    }
    this._events.get(event).add(listener);
    return this;
  }

  /**
   * Register a one-time event listener
   * @param {string} event
   * @param {Function} listener
   */
  once(event, listener) {
    if (typeof listener !== 'function') return this;
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    onceWrapper._originalListener = listener;
    this.on(event, onceWrapper);
    return this;
  }

  /**
   * Remove an event listener
   * @param {string} event
   * @param {Function} listener
   */
  off(event, listener) {
    if (!this._events.has(event)) return this;
    const listeners = this._events.get(event);

    for (const fn of listeners) {
      if (fn === listener || fn._originalListener === listener) {
        listeners.delete(fn);
      }
    }

    if (listeners.size === 0) {
      this._events.delete(event);
    }
    return this;
  }

  /**
   * Trigger an event
   * @param {string} event
   * @param  {...any} args
   */
  emit(event, ...args) {
    if (!this._events.has(event)) return false;
    const listeners = Array.from(this._events.get(event));
    for (const listener of listeners) {
      try {
        listener.apply(this, args);
      } catch (err) {
        console.error(`[Yogi_PLY] Error in event listener for "${event}":`, err);
      }
    }
    return true;
  }

  /**
   * Remove all listeners
   * @param {string} [event]
   */
  removeAllListeners(event) {
    if (event) {
      this._events.delete(event);
    } else {
      this._events.clear();
    }
    return this;
  }
}
